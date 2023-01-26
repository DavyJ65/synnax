#  Copyright 2023 Synnax Labs, Inc.
#
#  Use of this software is governed by the Business Source License included in the file
#  licenses/BSL.txt.
#
#  As of the Change Date specified in that file, in accordance with the Business Source
#  License, use of this software will be governed by the Apache License, Version 2.0,
#  included in the file licenses/APL.txt.

from rich import print
from rich.prompt import Confirm, FloatPrompt, IntPrompt, Prompt

from synnax.cli.console.protocol import Console

SYNNAX_PRIMARY_Z = "#3774D0"


class RichConsole:
    """A Console implementation using Rich."""

    info_color: str
    warn_color: str
    error_color: str
    success_color: str

    def __init__(
        self,
        info_color: str = SYNNAX_PRIMARY_Z,
        warn_color: str = "yellow",
        error_color: str = "red",
        success_color: str = "green",
    ):
        self.info_color = info_color
        self.warn_color = warn_color
        self.error_color = error_color
        self.success_color = success_color

    def _(self) -> Console:
        return self

    def info(self, message: str) -> None:
        print(f"[{self.info_color}]{message}[/]")

    def warn(self, message: str) -> None:
        print(f"[{self.warn_color}]{message}[/]")

    def error(self, message: str) -> None:
        print(f"[{self.error_color}]{message}[/]")

    def success(self, message: str) -> None:
        print(f"[{self.success_color}]{message}[/]")

    def ask(
        self,
        question: str,
        choices: list[str] | None = None,
        default: str | None = None,
    ) -> str | None:
        return Prompt.ask(
            question,
            choices=choices,
            default=default,
        )

    def ask_int(
        self,
        question: str,
        default: int | None = None,
    ) -> int | None:
        return IntPrompt.ask(
            question,
            default=default,
        )

    def ask_float(
        self,
        question: str,
        default: float | None = None,
    ) -> float | None:
        return FloatPrompt.ask(
            question,
            default=default,
        )

    def ask_password(
        self,
        question: str,
    ) -> str:
        return Prompt.ask(
            question,
            password=True,
        )

    def confirm(
        self,
        question: str,
        default: bool = True,
    ) -> bool:
        return Confirm.ask(
            question,
            default=default,
        )

    def table(
        self,
        columns: list[str],
        rows: list[dict],
    ) -> None:
        from rich.table import Table

        table = Table(show_header=True, header_style="bold magenta")
        for column in columns:
            table.add_column(column)
        for row in rows:
            # order the row.py by the columns
            table.add_row(*[row[column] for column in columns])

        print(table)
