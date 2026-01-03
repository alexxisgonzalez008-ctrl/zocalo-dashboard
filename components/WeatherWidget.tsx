import React from 'react';

export default function WeatherWidget() {
    return (
        <div className="w-full flex justify-center">
            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <iframe
                    src="https://www.meteoblue.com/es/tiempo/widget/daily/gobernador-g%c3%a1lvez_argentina_3854985?geoloc=fixed&days=7&tempunit=CELSIUS&windunit=KILOMETER_PER_HOUR&precipunit=MILLIMETER&coloured=coloured&pictoicon=1&maxtemperature=1&mintemperature=1&windspeed=1&windgust=0&winddirection=0&uv=0&humidity=0&precipitation=1&precipitationprobability=1&spot=1&pressure=0&layout=light&user_key=c633745be1ff7fb7&embed_key=9e1143caff594cea&sig=dcfebd9919ce374021d778b3198150460828c7d63862ce824dc6231358e16471"
                    frameBorder="0"
                    scrolling="NO"
                    allowTransparency={true}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                    style={{ width: '378px', height: '349px', border: 0, overflow: 'hidden' }}
                ></iframe>
                <div className="p-2 text-center bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                    <a
                        href="https://www.meteoblue.com/es/tiempo/semana/index"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                        Pronóstico por meteoblue
                    </a>
                </div>
            </div>
        </div>
    );
}
