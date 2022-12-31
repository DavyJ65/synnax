// Copyright 2022 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package mtls

import (
	"context"
	"github.com/cockroachdb/errors"
	"github.com/samber/lo"
	"github.com/synnaxlabs/freighter"
)

// AuthError is returned whenever the client certificate cannot be validated.
var AuthError = errors.Wrapf(
	freighter.SecurityError,
	"unable to verify TLS certificate",
)

// GateMiddleware is a per-request middleware that checks whether the underlying connection
// is protected by TLS and that the client certificate is valid. It checks the certificate
// CommonName against the provided list of expected CNs. If the check fails, the middleware
// returns an error.
//
// It's important to note that this middleware does not perform any certificate validation
// or TLS negotiation. GateMiddleware is particularly useful in scenarios where only a
// subset of endpoints must be protected by mTLS.
func GateMiddleware(expectedCNs ...string) freighter.Middleware {
	return freighter.MiddlewareFunc(func(
		ctx context.Context,
		md freighter.MD,
		next freighter.Next,
	) (freighter.MD, error) {
		if !md.Sec.TLS.Used ||
			(len(md.Sec.TLS.VerifiedChains) == 0 || len(md.Sec.TLS.VerifiedChains[0]) == 0) ||
			!lo.Contains(expectedCNs, md.Sec.TLS.VerifiedChains[0][0].Subject.CommonName) {
			return md, AuthError
		}
		return next(ctx, md)
	})
}
