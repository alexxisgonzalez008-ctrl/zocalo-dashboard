"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
)

const AccordionItem = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("border-b", className)}>{children}</div>
)

const AccordionTrigger = ({
    children,
    className,
    isOpen,
    onClick
}: {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onClick: () => void;
}) => (
    <div className="flex">
        <button
            onClick={onClick}
            className={cn(
                "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
                className
            )}
        >
            {children}
            <ChevronDown
                className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
            />
        </button>
    </div>
)

const AccordionContent = ({
    children,
    className,
    isOpen
}: {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
}) => (
    <div
        className={cn(
            "overflow-hidden text-sm transition-all",
            isOpen ? "animate-accordion-down" : "animate-accordion-up hidden"
        )}
    >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
)

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
