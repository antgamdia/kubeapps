import { grpc } from "@improbable-eng/grpc-web";
import { GrpcWebImpl } from "gen/kubeappsapis/core/plugins/v1alpha1/plugins";
import { Auth } from "./Auth";

export class GrpcClient {
  private authToken?: string;
  private baseUrl!: string;
  private grpcClient!: GrpcWebImpl;

  constructor() {
    this.authToken = Auth.getAuthToken() ?? "";
    // TODO(agamez): fetch this value dynamically
    this.baseUrl = "http://localhost:50051";
  }

  private GetClientConfig = () => {
    const headers = new Headers();
    if (this.authToken) {
      headers.append("Authorization", `Bearer ${this.authToken}`);
    }
    return {
      // https://github.com/improbable-eng/grpc-web/blob/master/client/grpc-web/docs/transport.md#specifying-transports.
      transport: grpc.CrossBrowserHttpTransport({ withCredentials: true }),
      debug: true,
      metadata: new grpc.Metadata(headers),
    };
  };

  public getGrpcClient = () => {
    if (!this.grpcClient) {
      this.grpcClient = new GrpcWebImpl(this.baseUrl, this.GetClientConfig());
    }
    return this.grpcClient;
  };
}
