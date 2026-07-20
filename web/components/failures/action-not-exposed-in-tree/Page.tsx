"use client";

import { useState } from "react";
import { BackLink } from "@/components/BackLink";

interface Props {
    faultActive?: boolean;
}

const ARTICLES = [
    {
        title: "Setting up two-factor authentication",
        snippet: "Add an extra layer of security to your account with 2FA.",
    },
    {
        title: "Managing billing and invoices",
        snippet: "View past invoices and update your payment method.",
    },
    {
        title: "Password reset instructions",
        snippet:
            "Steps to regain access to your account if you forget your password.",
    },
    {
        title: "Inviting team members",
        snippet: "Add teammates to your workspace and manage their roles.",
    },
    {
        title: "Exporting your data",
        snippet: "Download a copy of your account data in CSV or JSON format.",
    },
    {
        title: "Connecting third-party integrations",
        snippet: "Link Slack, GitHub, and other tools to your workspace.",
    },
];

export default function ActionNotExposedInTreePage({
    faultActive = false,
}: Props) {
    const [query, setQuery] = useState("");
    const [searched, setSearched] = useState<string | null>(null);

    function runSearch() {
        setSearched(query);
    }

    const results =
        searched === null
            ? ARTICLES
            : ARTICLES.filter(
                  (a) =>
                      a.title.toLowerCase().includes(searched.toLowerCase()) ||
                      a.snippet.toLowerCase().includes(searched.toLowerCase()),
              );

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="mx-auto max-w-xl px-4">
                <BackLink />

                <div className="bg-white rounded-xl border border-gray-200 p-7">
                    <h1 className="text-xl font-semibold text-gray-900 mb-6">
                        Help Center
                    </h1>

                    <div className="flex gap-2 mb-6">
                        {faultActive ? (
                            /*
                             * FAULT: visually a normal search bar, but it's a bare styled <div> —
                             * no <input>, no role, no accessible name, no keyboard/click handler
                             * wired to it. A text-based agent sees nothing actionable here even
                             * though a human sees an obvious search field.
                             */
                            <div className="flex-1 h-10 rounded-lg border border-gray-300 px-3 flex items-center text-sm text-gray-400 select-none">
                                Search articles…
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search articles…"
                                aria-label="Search articles"
                                className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        )}
                        <button
                            type="button"
                            onClick={runSearch}
                            disabled={faultActive}
                            className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {searched !== null && (
                        <p className="text-sm text-gray-600 mb-4">
                            Showing results for{" "}
                            <span className="font-medium text-gray-900">
                                &ldquo;{searched}&rdquo;
                            </span>
                        </p>
                    )}

                    {results.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No articles found.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {results.map((article) => (
                                <div
                                    key={article.title}
                                    className="rounded-lg border border-gray-200 p-4"
                                >
                                    <p className="text-sm font-medium text-gray-900">
                                        {article.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {article.snippet}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
