// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package auth

import (
	"context"
	"github.com/cockroachdb/errors"
	"github.com/synnaxlabs/synnax/pkg/auth/password"
	"github.com/synnaxlabs/x/gorp"
	"github.com/synnaxlabs/x/query"
)

// KV is a simple key-value backed Authenticator. It saves data to the provided
// gorp DB. It's important to note that all gorp.tx(s) provided to the Authenticator
// interface must be spawned from the same gorp DB.
type KV struct{ DB *gorp.DB }

var _ Authenticator = (*KV)(nil)

// Authenticate Authenticator.
func (db *KV) Authenticate(ctx context.Context, creds InsecureCredentials) error {
	_, err := db.authenticate(ctx, creds, db.DB)
	return err
}

func (db *KV) authenticate(
	ctx context.Context,
	creds InsecureCredentials,
	tx gorp.Tx,
) (SecureCredentials, error) {
	secureCreds, err := db.retrieve(ctx, tx, creds.Username)
	if err != nil {
		if errors.Is(err, query.NotFound) {
			return secureCreds, InvalidCredentials
		}
		return secureCreds, err
	}
	return secureCreds, secureCreds.Password.Validate(creds.Password)
}

// NewWriter implements Authenticator.
func (db *KV) NewWriter(tx gorp.Tx) Writer { return &kvWriter{service: db, tx: db.DB.OverrideTx(tx)} }

func (db *KV) exists(ctx context.Context, tx gorp.Tx, user string) (bool, error) {
	return gorp.NewRetrieve[string, SecureCredentials]().
		WhereKeys(user).
		Exists(ctx, gorp.OverrideTx(db.DB, tx))
}

func (db *KV) retrieve(ctx context.Context, tx gorp.Tx, user string) (SecureCredentials, error) {
	var creds SecureCredentials
	return creds, gorp.NewRetrieve[string, SecureCredentials]().
		WhereKeys(user).
		Entry(&creds).
		Exec(ctx, gorp.OverrideTx(db.DB, tx))
}

type kvWriter struct {
	service *KV
	tx      gorp.Tx
}

// Register implements Authenticator.
func (w *kvWriter) Register(ctx context.Context, creds InsecureCredentials) error {
	err := w.checkUsernameExists(ctx, creds.Username)
	if err != nil {
		return err
	}
	sec := SecureCredentials{Username: creds.Username}
	sec.Password, err = creds.Password.Hash()
	if err != nil {
		return err
	}
	return w.set(ctx, sec)
}

// UpdateUsername implements Authenticator.
func (w *kvWriter) UpdateUsername(ctx context.Context, creds InsecureCredentials, newUser string) error {
	secureCreds, err := w.service.authenticate(ctx, creds, w.tx)
	if err != nil {
		return err
	}
	if err = w.checkUsernameExists(ctx, newUser); err != nil {
		return err
	}
	secureCreds.Username = newUser
	return w.set(ctx, secureCreds)
}

// UpdatePassword implements Authenticator.
func (w *kvWriter) UpdatePassword(ctx context.Context, creds InsecureCredentials, newPass password.Raw) error {
	secureCreds, err := w.service.authenticate(ctx, creds, w.tx)
	if err != nil {
		return err
	}
	secureCreds.Password, err = newPass.Hash()
	if err != nil {
		return err
	}
	return w.set(ctx, secureCreds)
}

func (w *kvWriter) set(ctx context.Context, creds SecureCredentials) error {
	return gorp.NewCreate[string, SecureCredentials]().Entry(&creds).Exec(ctx, w.tx)
}

func (w *kvWriter) checkUsernameExists(ctx context.Context, user string) error {
	exists, err := w.service.exists(ctx, w.tx, user)
	if exists {
		return errors.New("[auth] - username already registered")
	}
	return err
}
