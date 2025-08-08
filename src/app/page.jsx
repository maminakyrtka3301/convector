'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import useSound from 'use-sound';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function Page() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState('mp3');
    const [quality, setQuality] = useState('480');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [controller, setController] = useState(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const socket = io({
            path: '/api/socketio',
        });
        socket.on('download-progress', data => {
            setProgress(prev => (isActive && data.percent > prev ? data.percent : prev));
        });
        return () => {
            socket.disconnect();
        };
    }, [isActive]);

    const [play] = useSound('/sounds/notification-sound.mp3', {
        volume: 0.3,
    });

    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    const handleSubmit = async () => {
        if (!url) {
            setError('Введите ссылку');
            return;
        }

        const isValid = (() => {
            try {
                const u = new URL(url);
                return u.protocol === 'http:' || u.protocol === 'https:';
            } catch {
                return false;
            }
        })();
        if (!isValid) {
            setError('Введите корректную ссылку');
            return;
        }

        setError('');

        setLoading(true);
        setIsActive(true);
        const abortController = new AbortController();
        setController(abortController);

        try {
            const res = await fetch('/api/convert', {
                method: 'POST',
                body: JSON.stringify({ url, format, ...(format === 'mp4' && { quality }) }),
                headers: { 'Content-Type': 'application/json' },
                signal: abortController.signal,
            });

            const filename = decodeURIComponent(res.headers.get('X-Filename') || 'audio');

            if (!res.ok) throw new Error('Ошибка конвертации');

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${filename}.${format}`;
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            toast.success('Готово!');
            play();
            setProgress(0);
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error(error);
            toast.error('Ошибка :(');
        } finally {
            setLoading(false);
            setController(null);
            setIsActive(false);
        }
    };

    const handleCancel = () => {
        if (controller) {
            controller.abort();
            setController(null);
            setIsActive(false);
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="relative flex gap-2 h-full flex flex-col justify-center items-center gap-24 mx-auto p-4 md:p-10 md:pb-[5%]">
            <div className="flex w-full justify-center gap-4">
                <Image src="/images/convector_logo.png" height={230} width={250} alt="Логотип" />
                <div className="flex flex-col justify-center">
                    <p className="hidden md:block md:text-[10em]">onvector</p>
                </div>
            </div>
            <div className="flex flex-col gap-y-8 w-[80%] md:w-auto jutify-center items-center">
                <div className="flex flex-col sm:flex-row w-full gap-4 w-full max-w-[800px]">
                    <div className="flex flex-col gap-2">
                        <Input
                            disabled={loading}
                            placeholder="Вставьте ссылку на ваше видео"
                            value={url}
                            onChange={e => {
                                setUrl(e.target.value);
                                if (error) setError('');
                            }}
                            className={cn('w-full sm:w-[400px]', error && 'border-red-500')}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <Select disabled={loading} value={format} onValueChange={setFormat}>
                        <SelectTrigger className="w-full sm:w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mp3">MP3</SelectItem>
                            <SelectItem value="mp4">MP4</SelectItem>
                            <SelectItem value="wav">WAV</SelectItem>
                        </SelectContent>
                    </Select>
                    {format === 'mp4' && (
                        <Select value={quality} onValueChange={setQuality}>
                            <SelectTrigger className="w-full sm:w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="480">480p</SelectItem>
                                <SelectItem value="360">360p</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                    <Button
                        onClick={controller ? handleCancel : handleSubmit}
                        className="w-full sm:w-auto"
                    >
                        {controller ? 'Отменить' : loading ? 'Минутку..' : 'Конвектировать'}
                    </Button>
                </div>
                <div className="min-h-[70px] flex items-center justify-center">
                    {loading && (
                        <div className="flex flex-col gap-y-2 justify-center items-center">
                            <Progress
                                className="w-[300px] md:w-[500px]"
                                value={progress.toFixed(1)}
                            />
                            <span className="font-semibold text-sm">{`${progress.toFixed(0)}%`}</span>
                        </div>
                    )}
                </div>
            </div>
            <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="absolute bottom-4 left-4 bg-muted hover:bg-muted/80 transition-colors p-3 rounded-full shadow-lg z-50"
                aria-label="Сменить тему"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="absolute bottom-4 text-center text-zinc-400 text-sm">
                Created by{' '}
                <a
                    href="https://t.me/maminakyrtka"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    maminakyrtka
                </a>
            </div>
        </div>
    );
}
