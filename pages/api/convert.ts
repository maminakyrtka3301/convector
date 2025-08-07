import { NextApiRequest, NextApiResponse } from 'next';
import { file as tmpFile } from 'tmp-promise';
import { spawn, execSync } from 'child_process';
import { promises as fs } from 'fs';
import ffmpeg from 'fluent-ffmpeg';

export const config = {
    api: { bodyParser: true },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { url: videoUrl, format = 'mp3', quality = 'best' } = req.body;

    if (!videoUrl || typeof videoUrl !== 'string') {
        return res.status(400).send('Невалидная ссылка');
    }

    const downloaded = await tmpFile({ postfix: '.webm' });
    const output = await tmpFile({ postfix: `.${format}` });

    let title = 'audio';
    try {
        const outputTitle = execSync(`yt-dlp --get-title ${videoUrl}`).toString().trim();
        if (outputTitle) title = outputTitle.replace(/[^\w\s\-\.]+/g, '').trim();
    } catch {
        console.warn('Не удалось получить название видео');
    }

    try {
        const io = (res.socket as any).server.io;
        if (!io) throw new Error('Socket.IO не инициализирован');

        let formatArg = 'bestaudio';
        if (format === 'mp4') {
            if (quality === 'best') {
                formatArg = 'bestvideo+bestaudio';
            } else {
                formatArg = `best[height<=${quality}]`;
            }
        } else {
            formatArg = 'bestaudio';
        }

        await new Promise((resolve, reject) => {
            const ytDlp = spawn('yt-dlp', [
                '--no-cache-dir',
                '--no-download-archive',
                '--no-part',
                '--no-continue',
                '--force-overwrites',
                '-f',
                formatArg,
                '-o',
                downloaded.path,
                videoUrl,
            ]);

            ytDlp.stdout.on('data', data => {
                const str = data.toString();
                const match = str.match(/\[download\]\s+([\d\.]+)%/);
                if (match) {
                    const percent = parseFloat(match[1]);
                    io.emit('download-progress', { percent });
                }
            });

            ytDlp.stderr.on('data', data => {
                console.error(`yt-dlp stderr: ${data}`);
            });

            ytDlp.on('close', async code => {
                if (code === 0) {
                    const stats = await fs.stat(downloaded.path);
                    if (stats.size === 0) {
                        reject(new Error('yt-dlp создал пустой файл'));
                    } else {
                        resolve(null);
                    }
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}`));
                }
            });
        });

        await new Promise((resolve, reject) => {
            let command = ffmpeg(downloaded.path);

            if (format === 'mp3') {
                command = command.audioCodec('libmp3lame').format('mp3');
            } else if (format === 'wav') {
                command = command.audioCodec('pcm_s16le').format('wav');
            } else if (format === 'mp4') {
                command = command.videoCodec('libx264').format('mp4');
            } else {
                return reject(new Error('Неподдерживаемый формат'));
            }

            command.save(output.path).on('end', resolve).on('error', reject);
        });

        const buffer = await fs.readFile(output.path);

        res.setHeader(
            'Content-Type',
            format === 'mp4' ? 'video/mp4' : format === 'wav' ? 'audio/wav' : 'audio/mpeg'
        );
        res.setHeader('Content-Disposition', `attachment; filename="${title}.${format}"`);
        res.setHeader('X-Filename', encodeURIComponent(title));
        return res.status(200).send(buffer);
    } catch (error) {
        console.error('Ошибка при обработке:', error);
        return res.status(500).send('Ошибка сервера');
    } finally {
        await fs.unlink(downloaded.path).catch(() => {});
        await fs.unlink(output.path).catch(() => {});
    }
}
