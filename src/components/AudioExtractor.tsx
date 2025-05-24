import { createSignal, onMount } from 'solid-js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util'; // toBlobURL 不再需要了


// @ffmpeg/core-mt@xxx/ is not work in Vercel. the root cause is unknown. @ffmpeg/core-mt@xxx is work in Dev environment
// so load https://unpkg.com/@ffmpeg/core@0.12.10 and https://unpkg.com/@ffmpeg/core-mt@0.12.10 for ffmpeg-core and ffmpeg-mt folder

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';

export const AudioExtractor = () => {
  const [ffmpegSignal] = createSignal(new FFmpeg()); // Renamed to avoid conflict if FFmpeg class is used elsewhere in scope
  const ffmpeg = ffmpegSignal; //保持ffmpeg变量名不变
  const [loaded, setLoaded] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [processing, setProcessing] = createSignal(false);

  onMount(async () => {

      try {
          await ffmpeg().load(
            {
              coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
              wasmURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.wasm`,
                'application/wasm'
              )
            }
          );
          setLoaded(true)
      } catch (error) {
          if (error instanceof Error) {
            console.error("Error name:", error.name)
          }
      }
  })

  const handleUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) return;

    const file = target.files[0];
    setProcessing(true);
    
    try {
      await ffmpeg().writeFile('input.mp4', await fetchFile(file)); // writeFile is async
      
      ffmpeg().on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      await ffmpeg().exec([
        '-i', 'input.mp4',
        '-q:a', '0',
        '-map', 'a',
        'output.mp3'
      ]);

      const data = await ffmpeg().readFile('output.mp3');
      const audioBlob = new Blob([data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'extracted_audio.mp3';
      a.click();
      
      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error('处理过程中出错：', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div class="flex flex-col space-y-4">
      <div class="form-control w-full">
        <input
          type="file"
          accept="video/*"
          onChange={handleUpload}
          disabled={!loaded() || processing()}
          class="file-input file-input-bordered file-input-primary w-full"
        />
      </div>
      
      {processing() && (
        <div class="w-full">
          <progress class="progress progress-primary w-full" value={progress()} max="100"></progress>
          <p class="text-center mt-2">{progress()}%</p>
        </div>
      )}
      
      {!loaded() && (
        <div class="flex items-center justify-center gap-2">
          <span class="loading loading-spinner loading-md"></span>
          <span class="text-sm">正在加载 FFmpeg...</span>
        </div>
      )}
    </div>
  );
};