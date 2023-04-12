// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package alamos

import (
	"github.com/synnaxlabs/x/config"
	"github.com/synnaxlabs/x/override"
	"go.uber.org/zap"
)

// LoggerConfig is the config for a Logger.
type LoggerConfig struct {
	// Zap sets the underlying zap.Logger. If nil, a no-op logger is used.
	Zap *zap.Logger
}

var (
	_ config.Config[LoggerConfig] = LoggerConfig{}
	// DefaultLoggerConfig is the default config for a Logger.
	DefaultLoggerConfig = LoggerConfig{}
)

// Validate implements config.Config.
func (c LoggerConfig) Validate() error { return nil }

// Override implements config.Config.
func (c LoggerConfig) Override(other LoggerConfig) LoggerConfig {
	c.Zap = override.Nil(c.Zap, other.Zap)
	return c
}

// Logger provides logging functionality. It's an enhanced wrapper around a zap.Logger
// that provides no-lop logging when nil.
type Logger struct {
	zap *zap.Logger
}

// NewLogger creates a new Logger with the given configuration.
func NewLogger(configs ...LoggerConfig) (*Logger, error) {
	cfg, err := config.New(DefaultLoggerConfig, configs...)
	if err != nil {
		return nil, err
	}
	return &Logger{zap: cfg.Zap}, nil
}

var _ sub[*Logger] = (*Logger)(nil)

func (l *Logger) sub(meta InstrumentationMeta) *Logger {
	if l == nil {
		return nil
	}
	return &Logger{zap: l.zap.Named(meta.Key)}
}

func (l *Logger) Debug(msg string, fields ...zap.Field) {
	if l == nil {
		return
	}
	l.zap.Debug(msg, fields...)
}

func (l *Logger) Debugf(format string, args ...interface{}) {
	if l == nil {
		return
	}
	l.zap.Sugar().Debugf(format, args...)
}

func (l *Logger) Info(msg string, fields ...zap.Field) {
	if l == nil {
		return
	}
	l.zap.Info(msg, fields...)
}

func (l *Logger) Warn(msg string, fields ...zap.Field) {
	if l == nil {
		return
	}
	l.zap.Warn(msg, fields...)
}

func (l *Logger) Error(msg string, fields ...zap.Field) {
	if l == nil {
		return
	}
	l.zap.Error(msg, fields...)
}

func (l *Logger) Fatal(msg string, fields ...zap.Field) {
	if l == nil {
		return
	}
	l.zap.Fatal(msg, fields...)
}

func (l *Logger) Panic(msg string, fields ...zap.Field) {
	if l == nil {
		return
	}
	l.zap.Panic(msg, fields...)
}

func (l *Logger) DPanic(msg string, fields ...zap.Field) {
	if l == nil {
		return
	}
	l.zap.DPanic(msg, fields...)
}

func newDevLogger(key string) *Logger {
	return &Logger{zap: zap.NewNop()}
}
