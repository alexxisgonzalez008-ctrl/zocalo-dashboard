"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ProjectSettings, CalendarEvent } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_API_KEY } from "@/lib/firebase";
import { toast } from "sonner";

interface GoogleCalendarContextType {
    isConnected: boolean;
    isSyncing: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    fetchEvents: (timeMin?: string, timeMax?: string) => Promise<CalendarEvent[]>;
    createEvent: (event: Omit<CalendarEvent, 'id' | 'googleEventId'>) => Promise<void>;
    error: string | null;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType | undefined>(undefined);

export function GoogleCalendarProvider({ children, settings }: { children: React.ReactNode, settings: ProjectSettings }) {
    const { googleAccessToken } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync token from AuthContext
    useEffect(() => {
        if (googleAccessToken) {
            setToken(googleAccessToken);
        }
    }, [googleAccessToken]);

    const isConnected = !!token;

    // Use project settings or global defaults
    const clientId = settings.googleClientId || GOOGLE_CALENDAR_CLIENT_ID;
    const apiKey = settings.googleApiKey || GOOGLE_CALENDAR_API_KEY;

    const connect = useCallback(async () => {
        if (!clientId) {
            setError("No se ha configurado el Client ID de Google.");
            return;
        }

        try {
            // If we don't have a token from Firebase yet, we fall back to GIS
            const client = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: "https://www.googleapis.com/auth/calendar.events",
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        setToken(tokenResponse.access_token);
                        setError(null);
                    }
                },
            });
            client.requestAccessToken();
        } catch (err) {
            console.error(err);
            setError("Error al iniciar sesión con Google.");
        }
    }, [clientId]);

    const disconnect = useCallback(() => {
        setToken(null);
    }, []);

    const fetchEvents = useCallback(async (timeMin?: string, timeMax?: string) => {
        if (!token) {
            console.warn("fetchEvents aborted: No token found");
            return [];
        }
        setIsSyncing(true);
        setError(null);
        try {
            const calendarId = settings.googleCalendarId || 'primary';
            // Use timeMax/timeMin with single events expanded
            let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime`;

            if (timeMin) url += `&timeMin=${encodeURIComponent(timeMin)}`;
            if (timeMax) url += `&timeMax=${encodeURIComponent(timeMax)}`;

            console.log("Fetching events for calendar:", calendarId, { timeMin, timeMax });
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("GCal Fetch API error:", errorData);
                throw new Error(errorData.error?.message || `HTTP Error ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched raw items:", data.items);

            // Map Google events to our CalendarEvent type
            return (data.items || []).map((item: any) => ({
                id: item.id,
                googleEventId: item.id,
                title: item.summary || "(Sin título)",
                type: (item.description?.includes('IslaraType:') ? item.description.split('IslaraType:')[1].split(' ')[0] : 'meeting') as any,
                start: item.start?.dateTime || item.start?.date,
                end: item.end?.dateTime || item.end?.date,
                description: item.description,
                location: item.location,
                allDay: !!item.start?.date
            }));
        } catch (err: any) {
            console.error("fetchEvents catch block:", err);
            setError(err.message || "Error al obtener eventos.");
            toast.error(`Error al sincronizar calendario: ${err.message}`);
            return [];
        } finally {
            setIsSyncing(false);
        }
    }, [token, settings.googleCalendarId, apiKey]);

    const createEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'googleEventId'>) => {
        if (!token) {
            const msg = "No hay una sesión de Google activa. Por favor, vuelve a conectar.";
            setError(msg);
            toast.error(msg);
            return;
        }

        const calendarId = settings.googleCalendarId || 'primary';
        setIsSyncing(true);
        setError(null);

        try {
            console.log("Attempting to create event in calendar:", calendarId, event);

            // Format dateTime correctly for Google API (append offset if missing)
            const formatDT = (dt: string) => {
                if (dt.includes('T') && !dt.includes('Z') && !/[+-]\d{2}:\d{2}$/.test(dt)) {
                    // It's a localized datetime from our picker, but Google likes offsets or Z
                    // Since we also send timeZone, we should ideally send either Z or offset.
                    // For simplicity, let's assume local time and let Google handle it via timeZone param.
                    return dt;
                }
                return dt;
            };

            const body = {
                summary: event.title,
                description: `${event.description || ""}\n\nIslaraType:${event.type}`,
                location: event.location,
                start: event.allDay
                    ? { date: event.start.split('T')[0] }
                    : {
                        dateTime: formatDT(event.start),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                end: event.allDay
                    ? { date: event.end.split('T')[0] }
                    : {
                        dateTime: formatDT(event.end),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
            };

            console.log("Create event body:", body);

            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Google Calendar API Error:", data);
                if (data.error?.message === "Insufficient Permission") {
                    throw new Error("No tienes permisos suficientes (Scopes). Por favor, sal de la aplicación y vuelve a entrar.");
                }
                throw new Error(data.error?.message || `Error ${response.status}: ${JSON.stringify(data.error)}`);
            }

            console.log("Event created successfully:", data);
            toast.success("Evento sincronizado con Google Calendar");
        } catch (err: any) {
            console.error("Calendar creation catch block:", err);
            setError(err.message || "Error al crear evento.");
            toast.error(`Error al crear evento: ${err.message}`);
            throw err;
        } finally {
            setIsSyncing(false);
        }
    }, [token, settings.googleCalendarId, apiKey]);

    // Load GIS script as fallback
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) document.body.removeChild(existingScript);
        };
    }, []);

    return (
        <GoogleCalendarContext.Provider value={{ isConnected, isSyncing, connect, disconnect, fetchEvents, createEvent, error }}>
            {children}
        </GoogleCalendarContext.Provider>
    );
}

export function useGoogleCalendar() {
    const context = useContext(GoogleCalendarContext);
    if (context === undefined) {
        throw new Error("useGoogleCalendar must be used within a GoogleCalendarProvider");
    }
    return context;
}
