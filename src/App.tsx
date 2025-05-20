import { AudioExtractor } from './components/AudioExtractor';
import './App.css';

function App() {
  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">视频音频提取工具</h1>
      <AudioExtractor />
    </div>
  );
}

export default App;
