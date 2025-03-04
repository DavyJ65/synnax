// Generated by the gRPC C++ plugin.
// If you make any local change, they will be lost.
// source: v1/channel.proto

#include "v1/channel.pb.h"
#include "v1/channel.grpc.pb.h"

#include <functional>
#include <grpcpp/support/async_stream.h>
#include <grpcpp/support/async_unary_call.h>
#include <grpcpp/impl/channel_interface.h>
#include <grpcpp/impl/client_unary_call.h>
#include <grpcpp/support/client_callback.h>
#include <grpcpp/support/message_allocator.h>
#include <grpcpp/support/method_handler.h>
#include <grpcpp/impl/rpc_service_method.h>
#include <grpcpp/support/server_callback.h>
#include <grpcpp/impl/server_callback_handlers.h>
#include <grpcpp/server_context.h>
#include <grpcpp/impl/service_type.h>
#include <grpcpp/support/sync_stream.h>
namespace api {
namespace v1 {

static const char* ChannelCreateService_method_names[] = {
  "/api.v1.ChannelCreateService/Exec",
};

std::unique_ptr< ChannelCreateService::Stub> ChannelCreateService::NewStub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options) {
  (void)options;
  std::unique_ptr< ChannelCreateService::Stub> stub(new ChannelCreateService::Stub(channel, options));
  return stub;
}

ChannelCreateService::Stub::Stub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options)
  : channel_(channel), rpcmethod_Exec_(ChannelCreateService_method_names[0], options.suffix_for_stats(),::grpc::internal::RpcMethod::NORMAL_RPC, channel)
  {}

::grpc::Status ChannelCreateService::Stub::Exec(::grpc::ClientContext* context, const ::api::v1::ChannelCreateRequest& request, ::api::v1::ChannelCreateResponse* response) {
  return ::grpc::internal::BlockingUnaryCall< ::api::v1::ChannelCreateRequest, ::api::v1::ChannelCreateResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), rpcmethod_Exec_, context, request, response);
}

void ChannelCreateService::Stub::async::Exec(::grpc::ClientContext* context, const ::api::v1::ChannelCreateRequest* request, ::api::v1::ChannelCreateResponse* response, std::function<void(::grpc::Status)> f) {
  ::grpc::internal::CallbackUnaryCall< ::api::v1::ChannelCreateRequest, ::api::v1::ChannelCreateResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_Exec_, context, request, response, std::move(f));
}

void ChannelCreateService::Stub::async::Exec(::grpc::ClientContext* context, const ::api::v1::ChannelCreateRequest* request, ::api::v1::ChannelCreateResponse* response, ::grpc::ClientUnaryReactor* reactor) {
  ::grpc::internal::ClientCallbackUnaryFactory::Create< ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_Exec_, context, request, response, reactor);
}

::grpc::ClientAsyncResponseReader< ::api::v1::ChannelCreateResponse>* ChannelCreateService::Stub::PrepareAsyncExecRaw(::grpc::ClientContext* context, const ::api::v1::ChannelCreateRequest& request, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncResponseReaderHelper::Create< ::api::v1::ChannelCreateResponse, ::api::v1::ChannelCreateRequest, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), cq, rpcmethod_Exec_, context, request);
}

::grpc::ClientAsyncResponseReader< ::api::v1::ChannelCreateResponse>* ChannelCreateService::Stub::AsyncExecRaw(::grpc::ClientContext* context, const ::api::v1::ChannelCreateRequest& request, ::grpc::CompletionQueue* cq) {
  auto* result =
    this->PrepareAsyncExecRaw(context, request, cq);
  result->StartCall();
  return result;
}

ChannelCreateService::Service::Service() {
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      ChannelCreateService_method_names[0],
      ::grpc::internal::RpcMethod::NORMAL_RPC,
      new ::grpc::internal::RpcMethodHandler< ChannelCreateService::Service, ::api::v1::ChannelCreateRequest, ::api::v1::ChannelCreateResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(
          [](ChannelCreateService::Service* service,
             ::grpc::ServerContext* ctx,
             const ::api::v1::ChannelCreateRequest* req,
             ::api::v1::ChannelCreateResponse* resp) {
               return service->Exec(ctx, req, resp);
             }, this)));
}

ChannelCreateService::Service::~Service() {
}

::grpc::Status ChannelCreateService::Service::Exec(::grpc::ServerContext* context, const ::api::v1::ChannelCreateRequest* request, ::api::v1::ChannelCreateResponse* response) {
  (void) context;
  (void) request;
  (void) response;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}


static const char* ChannelRetrieveService_method_names[] = {
  "/api.v1.ChannelRetrieveService/Exec",
};

std::unique_ptr< ChannelRetrieveService::Stub> ChannelRetrieveService::NewStub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options) {
  (void)options;
  std::unique_ptr< ChannelRetrieveService::Stub> stub(new ChannelRetrieveService::Stub(channel, options));
  return stub;
}

ChannelRetrieveService::Stub::Stub(const std::shared_ptr< ::grpc::ChannelInterface>& channel, const ::grpc::StubOptions& options)
  : channel_(channel), rpcmethod_Exec_(ChannelRetrieveService_method_names[0], options.suffix_for_stats(),::grpc::internal::RpcMethod::NORMAL_RPC, channel)
  {}

::grpc::Status ChannelRetrieveService::Stub::Exec(::grpc::ClientContext* context, const ::api::v1::ChannelRetrieveRequest& request, ::api::v1::ChannelRetrieveResponse* response) {
  return ::grpc::internal::BlockingUnaryCall< ::api::v1::ChannelRetrieveRequest, ::api::v1::ChannelRetrieveResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), rpcmethod_Exec_, context, request, response);
}

void ChannelRetrieveService::Stub::async::Exec(::grpc::ClientContext* context, const ::api::v1::ChannelRetrieveRequest* request, ::api::v1::ChannelRetrieveResponse* response, std::function<void(::grpc::Status)> f) {
  ::grpc::internal::CallbackUnaryCall< ::api::v1::ChannelRetrieveRequest, ::api::v1::ChannelRetrieveResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_Exec_, context, request, response, std::move(f));
}

void ChannelRetrieveService::Stub::async::Exec(::grpc::ClientContext* context, const ::api::v1::ChannelRetrieveRequest* request, ::api::v1::ChannelRetrieveResponse* response, ::grpc::ClientUnaryReactor* reactor) {
  ::grpc::internal::ClientCallbackUnaryFactory::Create< ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(stub_->channel_.get(), stub_->rpcmethod_Exec_, context, request, response, reactor);
}

::grpc::ClientAsyncResponseReader< ::api::v1::ChannelRetrieveResponse>* ChannelRetrieveService::Stub::PrepareAsyncExecRaw(::grpc::ClientContext* context, const ::api::v1::ChannelRetrieveRequest& request, ::grpc::CompletionQueue* cq) {
  return ::grpc::internal::ClientAsyncResponseReaderHelper::Create< ::api::v1::ChannelRetrieveResponse, ::api::v1::ChannelRetrieveRequest, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(channel_.get(), cq, rpcmethod_Exec_, context, request);
}

::grpc::ClientAsyncResponseReader< ::api::v1::ChannelRetrieveResponse>* ChannelRetrieveService::Stub::AsyncExecRaw(::grpc::ClientContext* context, const ::api::v1::ChannelRetrieveRequest& request, ::grpc::CompletionQueue* cq) {
  auto* result =
    this->PrepareAsyncExecRaw(context, request, cq);
  result->StartCall();
  return result;
}

ChannelRetrieveService::Service::Service() {
  AddMethod(new ::grpc::internal::RpcServiceMethod(
      ChannelRetrieveService_method_names[0],
      ::grpc::internal::RpcMethod::NORMAL_RPC,
      new ::grpc::internal::RpcMethodHandler< ChannelRetrieveService::Service, ::api::v1::ChannelRetrieveRequest, ::api::v1::ChannelRetrieveResponse, ::grpc::protobuf::MessageLite, ::grpc::protobuf::MessageLite>(
          [](ChannelRetrieveService::Service* service,
             ::grpc::ServerContext* ctx,
             const ::api::v1::ChannelRetrieveRequest* req,
             ::api::v1::ChannelRetrieveResponse* resp) {
               return service->Exec(ctx, req, resp);
             }, this)));
}

ChannelRetrieveService::Service::~Service() {
}

::grpc::Status ChannelRetrieveService::Service::Exec(::grpc::ServerContext* context, const ::api::v1::ChannelRetrieveRequest* request, ::api::v1::ChannelRetrieveResponse* response) {
  (void) context;
  (void) request;
  (void) response;
  return ::grpc::Status(::grpc::StatusCode::UNIMPLEMENTED, "");
}


}  // namespace api
}  // namespace v1

