// Copyright 2022 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package auth

import (
	"github.com/synnaxlabs/synnax/pkg/auth/password"
)

// InsecureCredentials is a set of unencrypted credentials. These are used to
// authenticate an entity (user, client, etc.). These credentials are NOT safe to store
// on disk.
type InsecureCredentials struct {
	Username string       `json:"username" validate:"required"`
	Password password.Raw `json:"password" validate:"required"`
}

// SecureCredentials is a set of encrypted credentials. These are used for persisting
// the credentials to disk.
type SecureCredentials struct {
	Username string
	Password password.Hashed
}

// GorpKey implements the gorp.Entry interface.
func (s SecureCredentials) GorpKey() string { return s.Username }

// SetOptions implements the gorp.Entry interface.
func (s SecureCredentials) SetOptions() []interface{} { return nil }
