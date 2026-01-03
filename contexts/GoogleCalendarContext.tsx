"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ProjectSettings, CalendarEvent } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_API_KEY } from "@/lib/firebase";

interface GoogleCalendarContextType {
    isConnected: boolean;
    isSyncing: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    fetchEvents: () => Promise<CalendarEvent[]>;
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

    const fetchEvents = useCallback(async () => {
        if (!token || !settings.googleCalendarId) return [];
        setIsSyncing(true);
        try {
            const calendarId = encodeURIComponent(settings.googleCalendarId || 'primary');
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            // Map Google events to our CalendarEvent type
            return (data.items || []).map((item: any) => ({
                id: item.id,
                googleEventId: item.id,
                title: item.summary,
                type: (item.description?.includes('IslaraType:') ? item.description.split('IslaraType:')[1].split(' ')[0] : 'meeting') as any,
                start: item.start.dateTime || item.start.date,
                end: item.end.dateTime || item.end.date,
                description: item.description,
                location: item.location,
            }));
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al obtener eventos.");
            return [];
        } finally {
            setIsSyncing(false);
        }
    }, [token, settings.googleCalendarId, apiKey]);

    const createEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'googleEventId'>) => {
        if (!token) {
            setError("No hay una sesión de Google activa. Por favor, vuelve a conectar.");
            return;
        }

        const calendarId = settings.googleCalendarId || 'primary';
        setIsSyncing(true);
        setError(null);

        try {
            console.log("Attempting to create event in calendar:", calendarId);
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        summary: event.title,
                        description: `${event.description || ""}\n\nIslaraType:${event.type}`,
                        location: event.location,
                        start: {
                            [event.allDay ? 'date' : 'dateTime']: event.start,
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        },
                        end: {
                            [event.allDay ? 'date' : 'dateTime']: event.end,
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        },
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Google Calendar API Error:", data);
                if (data.error?.message === "Insufficient Permission") {
                    throw new Error("No tienes permisos suficientes. Por favor, desconecta y vuelve a conectar tu cuenta de Google.");
                }
                throw new Error(data.error?.message || "Error desconocido al crear el evento.");
            }

            console.log("Event created successfully:", data);
        } catch (err: any) {
            console.error("Calendar creation catch block:", err);
            setError(err.message || "Error al crear evento.");
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
