"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, AlertCircle, Info } from "lucide-react";

interface ProposalCardProps {
    proposal: any;
    onConfirm: (id: string) => void;
    onCancel: (id: string) => void;
    loading?: boolean;
}

export default function ProposalCard({ proposal, onConfirm, onCancel, loading }: ProposalCardProps) {
    const preview = typeof proposal.preview === 'string' ? JSON.parse(proposal.preview) : proposal.preview;

    return (
        <Card className="border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900 shadow-lg overflow-hidden my-4">
            <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{preview.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{preview.summary}</p>
                    </div>
                </div>

                {preview.details && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 mb-4">
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                            "{preview.details}"
                        </p>
                    </div>
                )}

                {preview.warnings && preview.warnings.length > 0 && (
                    <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg mb-4 text-[10px] font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{preview.warnings[0]}</span>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        disabled={loading}
                        onClick={() => onConfirm(proposal.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar
                    </button>
                    <button
                        disabled={loading}
                        onClick={() => onCancel(proposal.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        <X className="w-3.5 h-3.5" />
                        Cancelar
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
