/*
Copyright 2021 VMware. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package server

import (
	"context"
	"fmt"
	"net"
	"net/http"

	"github.com/soheilhy/cmux"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	packages "github.com/kubeapps/kubeapps/cmd/kubeapps-apis/gen/core/packages/v1alpha1"
	plugins "github.com/kubeapps/kubeapps/cmd/kubeapps-apis/gen/core/plugins/v1alpha1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"google.golang.org/protobuf/encoding/protojson"
	log "k8s.io/klog/v2"
)

type ServeOptions struct {
	Port               int
	GrpcWebPort        int
	PluginDirs         []string
	ClustersConfigPath string
	PinnipedProxyURL   string
	//temporary flags while this component in under heavy development
	UnsafeUseDemoSA          bool
	UnsafeLocalDevKubeconfig bool
}

// Serve is the root command that is run when no other sub-commands are present.
// It runs the gRPC service, registering the configured plugins.
func Serve(serveOpts ServeOptions) {
	// Create the grpc server and register the reflection server (for now, useful for discovery
	// using grpcurl) or similar.
	grpcServer := grpc.NewServer()
	reflection.Register(grpcServer)

	// Create the http server, register our core service followed by any plugins.
	listenAddress := fmt.Sprintf(":%d", serveOpts.Port)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	gwArgs := gwHandlerArgs{
		ctx:         ctx,
		mux:         gatewayMux(),
		addr:        listenAddress,
		dialOptions: []grpc.DialOption{grpc.WithInsecure()},
	}
	httpServer := &http.Server{
		Handler: gwArgs.mux,
	}

	// Create the core.plugins server which handles registration of plugins,
	// and register it for both grpc and http.
	pluginsServer, err := NewPluginsServer(serveOpts, grpcServer, gwArgs)
	if err != nil {
		log.Fatalf("failed to initialize plugins server: %v", err)
	}
	plugins.RegisterPluginsServiceServer(grpcServer, pluginsServer)
	err = plugins.RegisterPluginsServiceHandlerFromEndpoint(gwArgs.ctx, gwArgs.mux, gwArgs.addr, gwArgs.dialOptions)
	if err != nil {
		log.Fatalf("failed to register core.plugins handler for gateway: %v", err)
	}

	// Create the core.packages server and register it for both grpc and http.
	packages.RegisterPackagesServiceServer(grpcServer, NewPackagesServer(pluginsServer.packagesPlugins))
	err = packages.RegisterPackagesServiceHandlerFromEndpoint(gwArgs.ctx, gwArgs.mux, gwArgs.addr, gwArgs.dialOptions)
	if err != nil {
		log.Fatalf("failed to register core.packages handler for gateway: %v", err)
	}

	listener, err := net.Listen("tcp", listenAddress)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// Multiplex the connection between grpc and http.
	// Note: due to a change in the grpc protocol, it's no longer possible to just match
	// on the simpler cmux.HTTP2HeaderField("content-type", "application/grpc"). More details
	// at https://github.com/soheilhy/cmux/issues/64
	mux := cmux.New(listener)

	grpcMuxListener := mux.MatchWithWriters(cmux.HTTP2MatchHeaderFieldSendSettings("content-type", "application/grpc"))
	httpMuxListener := mux.Match(cmux.Any())

	go grpcServer.Serve(grpcMuxListener)
	go httpServer.Serve(httpMuxListener)

	if serveOpts.UnsafeUseDemoSA {
		log.Warning("Using the demo Service Account for authenticating the requests. This is not recommended except for development purposes. Set `kubeappsapis.unsafeUseDemoSA: false` to remove this warning")
	}

	// wrapServer := grpcweb.WrapServer(grpcServer)

	webrpcProxy := grpcweb.WrapServer(grpcServer, grpcweb.WithOriginFunc(func(origin string) bool { return true }),
		grpcweb.WithWebsockets(true),
		grpcweb.WithWebsocketOriginFunc(func(req *http.Request) bool {
			return true
		}),
	)

	rpcProxy := &http.Server{
		Addr: fmt.Sprintf(":%d", serveOpts.GrpcWebPort),
	}

	rpcProxy.Handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Info(fmt.Sprintf("handling grpweb request: %s", r.URL.String()))
		if webrpcProxy.IsGrpcWebRequest(r) ||
			webrpcProxy.IsAcceptableGrpcCorsRequest(r) ||
			webrpcProxy.IsGrpcWebSocketRequest(r) {
			webrpcProxy.ServeHTTP(w, r)
		}
	})

	go func() {
		if err := rpcProxy.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("Space grpcweb proxy error", err)
		}
	}()
	log.Info(fmt.Sprintf("gRPC-web proxy server started on Port %d", serveOpts.GrpcWebPort))

	go func() {
		if err := mux.Serve(); err != nil && err != http.ErrServerClosed {
			log.Error(fmt.Sprintf("REST server failed to start on port %d", serveOpts.Port), err)
		}
	}()
	log.Info(fmt.Sprintf("gRPC-gateway server started on Port %d", serveOpts.Port))

	// log.Infof("Starting grpc-gateway server on :%d", serveOpts.Port)
	// if err := mux.Serve(); err != nil {
	// 	log.Fatalf("failed to serve: %v", err)
	// }

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", 50050))
	if err != nil {
		log.Error(fmt.Sprintf("failed to listen on port : %v", 50050), err)
	}
	log.Info(fmt.Sprintf("gRPC server started on Port %v", 50050))
	grpcServer.Serve(lis)

}

// gwHandlerArgs is a helper struct just encapsulating all the args
// required when registering an HTTP handler for the gateway.
type gwHandlerArgs struct {
	ctx         context.Context
	mux         *runtime.ServeMux
	addr        string
	dialOptions []grpc.DialOption
}

// Create a gateway mux that does not emit unpopulated fields.
func gatewayMux() *runtime.ServeMux {
	gwmux := runtime.NewServeMux(
		runtime.WithMarshalerOption(runtime.MIMEWildcard, &runtime.JSONPb{
			MarshalOptions: protojson.MarshalOptions{
				EmitUnpopulated: false,
			},
			UnmarshalOptions: protojson.UnmarshalOptions{
				DiscardUnknown: true,
			},
		}),
	)

	// TODO(agamez): remove these '/openapi.json' and '/docs' paths. They are serving a
	// static 'swagger-ui' dashboard with hardcoded values just intended for develoment purposes.
	// This docs will eventually converge into the docs already (properly) served by the dashboard
	err := gwmux.HandlePath(http.MethodGet, "/openapi.json", runtime.HandlerFunc(func(w http.ResponseWriter, r *http.Request, pathParams map[string]string) {
		http.ServeFile(w, r, "docs/kubeapps-apis.swagger.json")
	}))
	if err != nil {
		log.Fatalf("failed to serve: %v", err)
	}

	err = gwmux.HandlePath(http.MethodGet, "/docs", runtime.HandlerFunc(func(w http.ResponseWriter, r *http.Request, pathParams map[string]string) {
		http.ServeFile(w, r, "docs/index.html")
	}))
	if err != nil {
		log.Fatalf("failed to serve: %v", err)
	}

	return gwmux
}
