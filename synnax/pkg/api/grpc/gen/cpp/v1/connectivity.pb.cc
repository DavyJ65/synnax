// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: v1/connectivity.proto

#include "v1/connectivity.pb.h"

#include <algorithm>
#include "google/protobuf/io/coded_stream.h"
#include "google/protobuf/extension_set.h"
#include "google/protobuf/wire_format_lite.h"
#include "google/protobuf/descriptor.h"
#include "google/protobuf/generated_message_reflection.h"
#include "google/protobuf/reflection_ops.h"
#include "google/protobuf/wire_format.h"
#include "google/protobuf/generated_message_tctable_impl.h"
// @@protoc_insertion_point(includes)

// Must be included last.
#include "google/protobuf/port_def.inc"
PROTOBUF_PRAGMA_INIT_SEG
namespace _pb = ::google::protobuf;
namespace _pbi = ::google::protobuf::internal;
namespace _fl = ::google::protobuf::internal::field_layout;
namespace api {
namespace v1 {
        template <typename>
PROTOBUF_CONSTEXPR ConnectivityCheckResponse::ConnectivityCheckResponse(::_pbi::ConstantInitialized)
    : _impl_{
      /*decltype(_impl_.cluster_key_)*/ {
          &::_pbi::fixed_address_empty_string,
          ::_pbi::ConstantInitialized{},
      },
      /*decltype(_impl_._cached_size_)*/ {},
    } {}
struct ConnectivityCheckResponseDefaultTypeInternal {
  PROTOBUF_CONSTEXPR ConnectivityCheckResponseDefaultTypeInternal() : _instance(::_pbi::ConstantInitialized{}) {}
  ~ConnectivityCheckResponseDefaultTypeInternal() {}
  union {
    ConnectivityCheckResponse _instance;
  };
};

PROTOBUF_ATTRIBUTE_NO_DESTROY PROTOBUF_CONSTINIT
    PROTOBUF_ATTRIBUTE_INIT_PRIORITY1 ConnectivityCheckResponseDefaultTypeInternal _ConnectivityCheckResponse_default_instance_;
}  // namespace v1
}  // namespace api
static ::_pb::Metadata file_level_metadata_v1_2fconnectivity_2eproto[1];
static constexpr const ::_pb::EnumDescriptor**
    file_level_enum_descriptors_v1_2fconnectivity_2eproto = nullptr;
static constexpr const ::_pb::ServiceDescriptor**
    file_level_service_descriptors_v1_2fconnectivity_2eproto = nullptr;
const ::uint32_t TableStruct_v1_2fconnectivity_2eproto::offsets[] PROTOBUF_SECTION_VARIABLE(
    protodesc_cold) = {
    ~0u,  // no _has_bits_
    PROTOBUF_FIELD_OFFSET(::api::v1::ConnectivityCheckResponse, _internal_metadata_),
    ~0u,  // no _extensions_
    ~0u,  // no _oneof_case_
    ~0u,  // no _weak_field_map_
    ~0u,  // no _inlined_string_donated_
    ~0u,  // no _split_
    ~0u,  // no sizeof(Split)
    PROTOBUF_FIELD_OFFSET(::api::v1::ConnectivityCheckResponse, _impl_.cluster_key_),
};

static const ::_pbi::MigrationSchema
    schemas[] PROTOBUF_SECTION_VARIABLE(protodesc_cold) = {
        {0, -1, -1, sizeof(::api::v1::ConnectivityCheckResponse)},
};

static const ::_pb::Message* const file_default_instances[] = {
    &::api::v1::_ConnectivityCheckResponse_default_instance_._instance,
};
const char descriptor_table_protodef_v1_2fconnectivity_2eproto[] PROTOBUF_SECTION_VARIABLE(protodesc_cold) = {
    "\n\025v1/connectivity.proto\022\006api.v1\032\033google/"
    "protobuf/empty.proto\"<\n\031ConnectivityChec"
    "kResponse\022\037\n\013cluster_key\030\001 \001(\tR\nclusterK"
    "ey2Z\n\023ConnectivityService\022C\n\004Exec\022\026.goog"
    "le.protobuf.Empty\032!.api.v1.ConnectivityC"
    "heckResponse\"\000B\214\001\n\ncom.api.v1B\021Connectiv"
    "ityProtoP\001Z2github.com/synnaxlabs/synnax"
    "/pkg/api/grpc/v1;apiv1\242\002\003AXX\252\002\006Api.V1\312\002\006"
    "Api\\V1\342\002\022Api\\V1\\GPBMetadata\352\002\007Api::V1b\006p"
    "roto3"
};
static const ::_pbi::DescriptorTable* const descriptor_table_v1_2fconnectivity_2eproto_deps[1] =
    {
        &::descriptor_table_google_2fprotobuf_2fempty_2eproto,
};
static ::absl::once_flag descriptor_table_v1_2fconnectivity_2eproto_once;
const ::_pbi::DescriptorTable descriptor_table_v1_2fconnectivity_2eproto = {
    false,
    false,
    365,
    descriptor_table_protodef_v1_2fconnectivity_2eproto,
    "v1/connectivity.proto",
    &descriptor_table_v1_2fconnectivity_2eproto_once,
    descriptor_table_v1_2fconnectivity_2eproto_deps,
    1,
    1,
    schemas,
    file_default_instances,
    TableStruct_v1_2fconnectivity_2eproto::offsets,
    file_level_metadata_v1_2fconnectivity_2eproto,
    file_level_enum_descriptors_v1_2fconnectivity_2eproto,
    file_level_service_descriptors_v1_2fconnectivity_2eproto,
};

// This function exists to be marked as weak.
// It can significantly speed up compilation by breaking up LLVM's SCC
// in the .pb.cc translation units. Large translation units see a
// reduction of more than 35% of walltime for optimized builds. Without
// the weak attribute all the messages in the file, including all the
// vtables and everything they use become part of the same SCC through
// a cycle like:
// GetMetadata -> descriptor table -> default instances ->
//   vtables -> GetMetadata
// By adding a weak function here we break the connection from the
// individual vtables back into the descriptor table.
PROTOBUF_ATTRIBUTE_WEAK const ::_pbi::DescriptorTable* descriptor_table_v1_2fconnectivity_2eproto_getter() {
  return &descriptor_table_v1_2fconnectivity_2eproto;
}
// Force running AddDescriptors() at dynamic initialization time.
PROTOBUF_ATTRIBUTE_INIT_PRIORITY2
static ::_pbi::AddDescriptorsRunner dynamic_init_dummy_v1_2fconnectivity_2eproto(&descriptor_table_v1_2fconnectivity_2eproto);
namespace api {
namespace v1 {
// ===================================================================

class ConnectivityCheckResponse::_Internal {
 public:
};

ConnectivityCheckResponse::ConnectivityCheckResponse(::google::protobuf::Arena* arena)
    : ::google::protobuf::Message(arena) {
  SharedCtor(arena);
  // @@protoc_insertion_point(arena_constructor:api.v1.ConnectivityCheckResponse)
}
ConnectivityCheckResponse::ConnectivityCheckResponse(const ConnectivityCheckResponse& from) : ::google::protobuf::Message() {
  ConnectivityCheckResponse* const _this = this;
  (void)_this;
  new (&_impl_) Impl_{
      decltype(_impl_.cluster_key_){},
      /*decltype(_impl_._cached_size_)*/ {},
  };
  _internal_metadata_.MergeFrom<::google::protobuf::UnknownFieldSet>(
      from._internal_metadata_);
  _impl_.cluster_key_.InitDefault();
  #ifdef PROTOBUF_FORCE_COPY_DEFAULT_STRING
        _impl_.cluster_key_.Set("", GetArenaForAllocation());
  #endif  // PROTOBUF_FORCE_COPY_DEFAULT_STRING
  if (!from._internal_cluster_key().empty()) {
    _this->_impl_.cluster_key_.Set(from._internal_cluster_key(), _this->GetArenaForAllocation());
  }

  // @@protoc_insertion_point(copy_constructor:api.v1.ConnectivityCheckResponse)
}
inline void ConnectivityCheckResponse::SharedCtor(::_pb::Arena* arena) {
  (void)arena;
  new (&_impl_) Impl_{
      decltype(_impl_.cluster_key_){},
      /*decltype(_impl_._cached_size_)*/ {},
  };
  _impl_.cluster_key_.InitDefault();
  #ifdef PROTOBUF_FORCE_COPY_DEFAULT_STRING
        _impl_.cluster_key_.Set("", GetArenaForAllocation());
  #endif  // PROTOBUF_FORCE_COPY_DEFAULT_STRING
}
ConnectivityCheckResponse::~ConnectivityCheckResponse() {
  // @@protoc_insertion_point(destructor:api.v1.ConnectivityCheckResponse)
  _internal_metadata_.Delete<::google::protobuf::UnknownFieldSet>();
  SharedDtor();
}
inline void ConnectivityCheckResponse::SharedDtor() {
  ABSL_DCHECK(GetArenaForAllocation() == nullptr);
  _impl_.cluster_key_.Destroy();
}
void ConnectivityCheckResponse::SetCachedSize(int size) const {
  _impl_._cached_size_.Set(size);
}

PROTOBUF_NOINLINE void ConnectivityCheckResponse::Clear() {
// @@protoc_insertion_point(message_clear_start:api.v1.ConnectivityCheckResponse)
  ::uint32_t cached_has_bits = 0;
  // Prevent compiler warnings about cached_has_bits being unused
  (void) cached_has_bits;

  _impl_.cluster_key_.ClearToEmpty();
  _internal_metadata_.Clear<::google::protobuf::UnknownFieldSet>();
}

const char* ConnectivityCheckResponse::_InternalParse(
    const char* ptr, ::_pbi::ParseContext* ctx) {
  ptr = ::_pbi::TcParser::ParseLoop(this, ptr, ctx, &_table_.header);
  return ptr;
}


PROTOBUF_CONSTINIT PROTOBUF_ATTRIBUTE_INIT_PRIORITY1
const ::_pbi::TcParseTable<0, 1, 0, 52, 2> ConnectivityCheckResponse::_table_ = {
  {
    0,  // no _has_bits_
    0, // no _extensions_
    1, 0,  // max_field_number, fast_idx_mask
    offsetof(decltype(_table_), field_lookup_table),
    4294967294,  // skipmap
    offsetof(decltype(_table_), field_entries),
    1,  // num_field_entries
    0,  // num_aux_entries
    offsetof(decltype(_table_), field_names),  // no aux_entries
    &_ConnectivityCheckResponse_default_instance_._instance,
    ::_pbi::TcParser::GenericFallback,  // fallback
  }, {{
    // string cluster_key = 1 [json_name = "clusterKey"];
    {::_pbi::TcParser::FastUS1,
     {10, 63, 0, PROTOBUF_FIELD_OFFSET(ConnectivityCheckResponse, _impl_.cluster_key_)}},
  }}, {{
    65535, 65535
  }}, {{
    // string cluster_key = 1 [json_name = "clusterKey"];
    {PROTOBUF_FIELD_OFFSET(ConnectivityCheckResponse, _impl_.cluster_key_), 0, 0,
    (0 | ::_fl::kFcSingular | ::_fl::kUtf8String | ::_fl::kRepAString)},
  }},
  // no aux_entries
  {{
    "\40\13\0\0\0\0\0\0"
    "api.v1.ConnectivityCheckResponse"
    "cluster_key"
  }},
};

::uint8_t* ConnectivityCheckResponse::_InternalSerialize(
    ::uint8_t* target,
    ::google::protobuf::io::EpsCopyOutputStream* stream) const {
  // @@protoc_insertion_point(serialize_to_array_start:api.v1.ConnectivityCheckResponse)
  ::uint32_t cached_has_bits = 0;
  (void)cached_has_bits;

  // string cluster_key = 1 [json_name = "clusterKey"];
  if (!this->_internal_cluster_key().empty()) {
    const std::string& _s = this->_internal_cluster_key();
    ::google::protobuf::internal::WireFormatLite::VerifyUtf8String(
        _s.data(), static_cast<int>(_s.length()), ::google::protobuf::internal::WireFormatLite::SERIALIZE, "api.v1.ConnectivityCheckResponse.cluster_key");
    target = stream->WriteStringMaybeAliased(1, _s, target);
  }

  if (PROTOBUF_PREDICT_FALSE(_internal_metadata_.have_unknown_fields())) {
    target =
        ::_pbi::WireFormat::InternalSerializeUnknownFieldsToArray(
            _internal_metadata_.unknown_fields<::google::protobuf::UnknownFieldSet>(::google::protobuf::UnknownFieldSet::default_instance), target, stream);
  }
  // @@protoc_insertion_point(serialize_to_array_end:api.v1.ConnectivityCheckResponse)
  return target;
}

::size_t ConnectivityCheckResponse::ByteSizeLong() const {
// @@protoc_insertion_point(message_byte_size_start:api.v1.ConnectivityCheckResponse)
  ::size_t total_size = 0;

  ::uint32_t cached_has_bits = 0;
  // Prevent compiler warnings about cached_has_bits being unused
  (void) cached_has_bits;

  // string cluster_key = 1 [json_name = "clusterKey"];
  if (!this->_internal_cluster_key().empty()) {
    total_size += 1 + ::google::protobuf::internal::WireFormatLite::StringSize(
                                    this->_internal_cluster_key());
  }

  return MaybeComputeUnknownFieldsSize(total_size, &_impl_._cached_size_);
}

const ::google::protobuf::Message::ClassData ConnectivityCheckResponse::_class_data_ = {
    ::google::protobuf::Message::CopyWithSourceCheck,
    ConnectivityCheckResponse::MergeImpl
};
const ::google::protobuf::Message::ClassData*ConnectivityCheckResponse::GetClassData() const { return &_class_data_; }


void ConnectivityCheckResponse::MergeImpl(::google::protobuf::Message& to_msg, const ::google::protobuf::Message& from_msg) {
  auto* const _this = static_cast<ConnectivityCheckResponse*>(&to_msg);
  auto& from = static_cast<const ConnectivityCheckResponse&>(from_msg);
  // @@protoc_insertion_point(class_specific_merge_from_start:api.v1.ConnectivityCheckResponse)
  ABSL_DCHECK_NE(&from, _this);
  ::uint32_t cached_has_bits = 0;
  (void) cached_has_bits;

  if (!from._internal_cluster_key().empty()) {
    _this->_internal_set_cluster_key(from._internal_cluster_key());
  }
  _this->_internal_metadata_.MergeFrom<::google::protobuf::UnknownFieldSet>(from._internal_metadata_);
}

void ConnectivityCheckResponse::CopyFrom(const ConnectivityCheckResponse& from) {
// @@protoc_insertion_point(class_specific_copy_from_start:api.v1.ConnectivityCheckResponse)
  if (&from == this) return;
  Clear();
  MergeFrom(from);
}

PROTOBUF_NOINLINE bool ConnectivityCheckResponse::IsInitialized() const {
  return true;
}

void ConnectivityCheckResponse::InternalSwap(ConnectivityCheckResponse* other) {
  using std::swap;
  auto* lhs_arena = GetArenaForAllocation();
  auto* rhs_arena = other->GetArenaForAllocation();
  _internal_metadata_.InternalSwap(&other->_internal_metadata_);
  ::_pbi::ArenaStringPtr::InternalSwap(&_impl_.cluster_key_, lhs_arena,
                                       &other->_impl_.cluster_key_, rhs_arena);
}

::google::protobuf::Metadata ConnectivityCheckResponse::GetMetadata() const {
  return ::_pbi::AssignDescriptors(
      &descriptor_table_v1_2fconnectivity_2eproto_getter, &descriptor_table_v1_2fconnectivity_2eproto_once,
      file_level_metadata_v1_2fconnectivity_2eproto[0]);
}
// @@protoc_insertion_point(namespace_scope)
}  // namespace v1
}  // namespace api
namespace google {
namespace protobuf {
}  // namespace protobuf
}  // namespace google
// @@protoc_insertion_point(global_scope)
#include "google/protobuf/port_undef.inc"
