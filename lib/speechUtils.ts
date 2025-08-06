import * as Speech from 'expo-speech';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  language?: string;
  voice?: string;
  voiceType?: string;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: any) => void;
  onProgress?: (currentSentence: number, totalSentences: number) => void;
}

export interface SpeechPosition {
  currentSentence: number;
  currentWord: number;
  totalSentences: number;
  totalWords: number;
  timeElapsed: number;
}

export class TextToSpeechManager {
  private static instance: TextToSpeechManager;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private currentText: string = '';
  private sentences: string[] = [];
  private currentSentenceIndex: number = 0;
  private currentWordIndex: number = 0;
  private totalDuration: number = 0;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private progressInterval: NodeJS.Timeout | null = null;
  private currentOptions: SpeechOptions = {};

  static getInstance(): TextToSpeechManager {
    if (!TextToSpeechManager.instance) {
      TextToSpeechManager.instance = new TextToSpeechManager();
    }
    return TextToSpeechManager.instance;
  }

  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    if (this.isPlaying) {
      await this.stop();
    }

    const cleanText = this.cleanTextForSpeech(text);
    this.currentText = cleanText;
    this.sentences = this.splitIntoSentences(cleanText);
    this.currentSentenceIndex = 0;
    this.currentWordIndex = 0;
    this.currentOptions = options;
    this.startTime = Date.now();
    this.pausedTime = 0;
    
    // Estimate total duration based on text length and speech rate
    const wordsPerMinute = 150 * (options.rate || 0.85); // Average speaking rate
    const totalWords = cleanText.split(' ').length;
    this.totalDuration = (totalWords / wordsPerMinute) * 60 * 1000; // Convert to milliseconds

    await this.speakFromCurrentPosition();
  }

  private async speakFromCurrentPosition(): Promise<void> {
    if (this.currentSentenceIndex >= this.sentences.length) {
      this.handleSpeechComplete();
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;

    // Start progress tracking
    this.startProgressTracking();

    const remainingSentences = this.sentences.slice(this.currentSentenceIndex);
    const textToSpeak = remainingSentences.join(' ');

    const speechOptions = {
      rate: this.currentOptions.rate || 0.85,
      pitch: this.currentOptions.pitch || 1.0,
      language: this.currentOptions.language || 'en-US',
      voice: this.currentOptions.voice,
      onStart: () => {
        if (this.currentSentenceIndex === 0) {
          this.currentOptions.onStart?.();
        }
      },
      onDone: () => {
        this.handleSpeechComplete();
      },
      onStopped: () => {
        this.isPlaying = false;
        this.stopProgressTracking();
        this.currentOptions.onStopped?.();
      },
      onError: (error: any) => {
        this.isPlaying = false;
        this.stopProgressTracking();
        this.currentOptions.onError?.(error);
      },
    };

    try {
      await Speech.speak(textToSpeak, speechOptions);
    } catch (error) {
      this.isPlaying = false;
      this.stopProgressTracking();
      this.currentOptions.onError?.(error);
    }
  }

  async stop(): Promise<void> {
    if (this.isPlaying || this.isPaused) {
      console.log('Stopping TTS completely');
      await Speech.stop();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentText = '';
      this.sentences = [];
      this.currentSentenceIndex = 0;
      this.currentWordIndex = 0;
      this.pausedTime = 0;
      this.stopProgressTracking();
    }
  }

  async pause(): Promise<void> {
    if (this.isPlaying) {
      console.log('Pausing TTS at sentence:', this.currentSentenceIndex);
      await Speech.stop(); // expo-speech doesn't have true pause, so we stop and track position
      this.isPlaying = false;
      this.isPaused = true;
      this.pausedTime = Date.now();
      this.stopProgressTracking();
    }
  }

  async resume(): Promise<void> {
    if (this.isPaused && this.currentText) {
      console.log('Resuming TTS from sentence:', this.currentSentenceIndex);
      // Calculate how much time passed during pause and adjust start time
      const pauseDuration = Date.now() - this.pausedTime;
      this.startTime += pauseDuration;
      
      this.isPaused = false;
      // Resume from current position, not from beginning
      await this.speakFromCurrentPosition();
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  getCurrentText(): string {
    return this.currentText;
  }

  getCurrentPosition(): SpeechPosition {
    const totalWords = this.currentText.split(' ').length;
    const elapsedTime = this.isPlaying ? Date.now() - this.startTime : 
                       this.isPaused ? this.pausedTime - this.startTime : 0;

    return {
      currentSentence: this.currentSentenceIndex,
      currentWord: this.currentWordIndex,
      totalSentences: this.sentences.length,
      totalWords: totalWords,
      timeElapsed: elapsedTime,
    };
  }

  getProgress(): number {
    if (this.sentences.length === 0) return 0;
    return (this.currentSentenceIndex / this.sentences.length) * 100;
  }

  async seekToSentence(sentenceIndex: number): Promise<void> {
    if (sentenceIndex >= 0 && sentenceIndex < this.sentences.length) {
      console.log(`Seeking to sentence ${sentenceIndex} of ${this.sentences.length}`);
      this.currentSentenceIndex = sentenceIndex;
      this.currentWordIndex = 0;
      
      // Update start time to reflect the new position
      const estimatedTimePerSentence = this.totalDuration / this.sentences.length;
      const estimatedElapsedTime = sentenceIndex * estimatedTimePerSentence;
      this.startTime = Date.now() - estimatedElapsedTime;
      
      if (this.isPlaying || this.isPaused) {
        await Speech.stop();
        if (this.isPlaying) {
          await this.speakFromCurrentPosition();
        }
      }
    }
  }

  private handleSpeechComplete(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.stopProgressTracking();
    this.currentOptions.onDone?.();
  }

  private startProgressTracking(): void {
    this.stopProgressTracking(); // Clear any existing interval
    
    this.progressInterval = setInterval(() => {
      if (this.isPlaying) {
        // Estimate current sentence based on elapsed time
        const elapsedTime = Date.now() - this.startTime;
        const estimatedProgress = Math.min(elapsedTime / this.totalDuration, 1);
        const estimatedSentence = Math.floor(estimatedProgress * this.sentences.length);
        
        if (estimatedSentence !== this.currentSentenceIndex && estimatedSentence < this.sentences.length) {
          this.currentSentenceIndex = estimatedSentence;
          this.currentOptions.onProgress?.(this.currentSentenceIndex, this.sentences.length);
        }
      }
    }, 500); // Update every 500ms
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private splitIntoSentences(text: string): string[] {
    // Enhanced sentence splitting that handles more cases
    return text
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim());
  }

  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/\n\s*\n/g, '. ') // Replace double line breaks with periods
      .replace(/\n/g, ' ') // Replace single line breaks with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?;:()-]/g, '') // Remove special characters except basic punctuation
      .replace(/([.!?])\s*([a-z])/g, '$1 $2') // Ensure proper spacing after punctuation
      .replace(/([a-z])([A-Z])/g, '$1. $2') // Add periods between sentences without punctuation
      .trim();
  }

  // Method to speak story content with natural pacing
  async speakStoryContent(story: any, options: SpeechOptions = {}): Promise<void> {
    let textToSpeak = '';
    
    // Build comprehensive story text
    if (story.title) {
      textToSpeak += `${story.title}. `;
    }
    
    if (story.author) {
      textToSpeak += `By ${story.author}. `;
    }
    
    // Add a natural pause before starting the story
    textToSpeak += 'Now beginning the story. ';
    
    if (story.content) {
      textToSpeak += this.enhanceTextForNaturalSpeech(story.content);
    } else {
      // If no content, use description or create placeholder content
      if (story.description) {
        textToSpeak += this.enhanceTextForNaturalSpeech(story.description);
        textToSpeak += ' This is a preview of the story. The full version would continue with more details and adventures.';
      } else {
        textToSpeak += this.generateSampleContent(story);
      }
    }

    // Enhanced options for more natural speech using audio preferences
    const naturalOptions: SpeechOptions = {
      rate: options.rate || 0.75, // Base rate, will be adjusted by selected voice
      pitch: options.pitch || 1.0,
      language: options.language || 'en-US',
      voice: options.voice || await this.getBestVoiceForType(options.voiceType),
      ...options
    };

    await this.speak(textToSpeak, naturalOptions);
  }

  // Method to speak all text content from a page/component
  async speakPageContent(elements: string[], options: SpeechOptions = {}): Promise<void> {
    const combinedText = elements
      .filter(text => text && text.trim().length > 0)
      .join('. ');
    
    if (combinedText.trim().length > 0) {
      await this.speak(combinedText, options);
    }
  }

  // Enhance text for more natural speech
  private enhanceTextForNaturalSpeech(text: string): string {
    return text
      .replace(/\.\.\./g, ', with a pause,') // Replace ellipsis with natural pause
      .replace(/--/g, ', ') // Replace dashes with commas
      .replace(/\b(Mr|Mrs|Dr|Ms)\./g, '$1') // Remove periods from titles
      .replace(/\b(\d+)\b/g, (match) => this.numberToWords(parseInt(match))) // Convert numbers to words
      .replace(/([.!?])\s*\n/g, '$1 ') // Ensure proper spacing after punctuation
      .replace(/\s*\n\s*/g, '. ') // Convert line breaks to natural pauses
      .replace(/([a-z])([A-Z])/g, '$1. $2') // Add pauses between sentences
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim();
  }

  // Convert numbers to words for more natural speech
  private numberToWords(num: number): string {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num === 0) return 'zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + this.numberToWords(num % 100) : '');
    
    return num.toString(); // Fallback for larger numbers
  }

  // Generate sample content for stories without content
  private generateSampleContent(story: any): string {
    const sampleContent = {
      'Adventure': 'The journey began at dawn, with our hero setting out into the unknown wilderness. Every step forward brought new challenges and discoveries that would test their courage and determination.',
      'Mystery': 'Something was not right in the quiet town. Strange occurrences had been reported, and our detective knew that beneath the surface lay secrets waiting to be uncovered.',
      'Sci-Fi': 'In the distant future, humanity had reached for the stars. Advanced technology and alien encounters awaited those brave enough to explore the vast cosmos.',
      'Fantasy': 'Magic filled the air in this enchanted realm. Dragons soared overhead while brave warriors embarked on quests that would determine the fate of kingdoms.',
      'Horror': 'The old house creaked in the wind, its shadows hiding secrets that should have remained buried. Those who entered rarely spoke of what they found within.',
      'Romance': 'Two hearts destined to meet across time and space, their love story unfolding against all odds in a tale that would span lifetimes.',
    };

    const categoryContent = sampleContent[story.category as keyof typeof sampleContent] || 
      'An incredible story unfolds, taking the listener on an unforgettable journey filled with wonder, excitement, and discovery.';

    return `${categoryContent} ${story.description || ''} This story continues with rich details and engaging characters that bring the narrative to life.`;
  }

  // Get the best available voice for natural speech
  private async getBestVoice(): Promise<string | undefined> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      // Prefer high-quality voices
      const preferredVoices = voices.filter(voice => 
        voice.quality === 'Enhanced' || voice.quality === 'Premium'
      );

      if (preferredVoices.length > 0) {
        // Prefer female voices for storytelling (generally more engaging)
        const femaleVoices = preferredVoices.filter(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('karen')
        );

        if (femaleVoices.length > 0) {
          return femaleVoices[0].identifier;
        }

        return preferredVoices[0].identifier;
      }

      return voices.length > 0 ? voices[0].identifier : undefined;
    } catch (error) {
      return undefined;
    }
  }

  // Get the best voice based on voice type preferences
  async getBestVoiceForType(voiceType?: string): Promise<string | undefined> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      // Filter for high-quality English voices
      const englishVoices = voices.filter(voice => 
        voice.language.includes('en') && 
        (voice.quality === 'Enhanced' || voice.quality === 'Default' || voice.quality === 'Premium')
      );

      if (englishVoices.length === 0) return undefined;

      // Voice type preferences mapping
      const voicePreferences: { [key: string]: (voice: any) => boolean } = {
        'natural-female': (voice) => voice.name?.toLowerCase().includes('female') || 
                                   voice.name?.toLowerCase().includes('woman') ||
                                   voice.name?.toLowerCase().includes('samantha') ||
                                   voice.name?.toLowerCase().includes('karen'),
        'natural-male': (voice) => voice.name?.toLowerCase().includes('male') || 
                                 voice.name?.toLowerCase().includes('man') ||
                                 voice.name?.toLowerCase().includes('daniel') ||
                                 voice.name?.toLowerCase().includes('alex'),
        'storyteller-female': (voice) => (voice.name?.toLowerCase().includes('female') || 
                                        voice.name?.toLowerCase().includes('woman')) && 
                                       voice.quality === 'Enhanced',
        'professional-male': (voice) => (voice.name?.toLowerCase().includes('male') || 
                                       voice.name?.toLowerCase().includes('man')) && 
                                      voice.quality === 'Enhanced',
        'young-female': (voice) => voice.name?.toLowerCase().includes('female') ||
                                 voice.name?.toLowerCase().includes('susan'),
        'narrator-male': (voice) => voice.name?.toLowerCase().includes('male') ||
                                  voice.name?.toLowerCase().includes('tom')
      };

      // Try to find a voice matching the type preference
      if (voiceType && voicePreferences[voiceType]) {
        const preferredVoices = englishVoices.filter(voicePreferences[voiceType]);
        if (preferredVoices.length > 0) {
          return preferredVoices[0].identifier;
        }
      }

      // Fallback to best available voice
      const sortedVoices = englishVoices.sort((a, b) => {
        if (a.quality === 'Enhanced' && b.quality !== 'Enhanced') return -1;
        if (b.quality === 'Enhanced' && a.quality !== 'Enhanced') return 1;
        return 0;
      });

      return sortedVoices[0].identifier;
    } catch (error) {
      console.warn('Failed to get voice for type:', error);
      return await this.getBestVoice();
    }
  }

  // Check if speech is available on the device
  async isSpeechAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Get available voices
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      return [];
    }
  }
}

export const speechManager = TextToSpeechManager.getInstance();