# syntax = docker/dockerfile:1

FROM bitnami/golang:1.16.5 as builder
WORKDIR /go/src/github.com/kubeapps/kubeapps
COPY go.mod go.sum ./
COPY pkg pkg
COPY cmd cmd

ARG BUF_VERSION="0.43.2"
RUN curl -sSL "https://github.com/bufbuild/buf/releases/download/v$BUF_VERSION/buf-Linux-x86_64" -o "/tmp/buf" && chmod +x "/tmp/buf"

# With the trick below, Go's build cache is kept between builds.
# https://github.com/golang/go/issues/27719#issuecomment-514747274
RUN --mount=type=cache,target=/go/pkg/mod  \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

# Lint the proto files to detect errors at build time
RUN /tmp/buf lint ./cmd/kubeapps-apis

# Build the main grpc server
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build ./cmd/kubeapps-apis

# Build 'kapp-controller' plugin, version 'v1alpha1'
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build \
    -o /kapp-controller-packages-v1alpha1-plugin.so -buildmode=plugin \
    ./cmd/kubeapps-apis/plugins/kapp_controller/packages/v1alpha1/*.go

## Build 'fluxv2' plugin, version 'v1alpha1'
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build \
    -o /fluxv2-packages-v1alpha1-plugin.so -buildmode=plugin \
    ./cmd/kubeapps-apis/plugins/fluxv2/packages/v1alpha1/*.go

## Build 'helm' plugin, version 'v1alpha1'
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build \
    -o /helm-packages-v1alpha1-plugin.so -buildmode=plugin \
    ./cmd/kubeapps-apis/plugins/helm/packages/v1alpha1/*.go

# Note: unlike the other docker images for go, we cannot use scratch as the plugins
# are loaded using the dynamic linker.
FROM bitnami/minideb:buster
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /go/src/github.com/kubeapps/kubeapps/kubeapps-apis /kubeapps-apis
COPY --from=builder /kapp-controller-packages-v1alpha1-plugin.so /plugins/
COPY --from=builder /fluxv2-packages-v1alpha1-plugin.so /plugins/
COPY --from=builder /helm-packages-v1alpha1-plugin.so /plugins/

EXPOSE 50051
USER 1001
ENTRYPOINT [ "/kubeapps-apis" ]
CMD [ "--help" ]
