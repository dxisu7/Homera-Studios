import React, { useState, useEffect } from 'react';
import { Upload, Wand2, Terminal, Image as ImageIcon, CheckCircle, RefreshCw, LayoutGrid, Sparkles } from 'lucide-react';
import { interpretRequest, executeTransformation } from './services/geminiService';
import { HomeraAiRequest, TransformationLog, User, SavedResult } from './types';
import { subscriptionPlans } from './config/subscriptions';

// Components
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { LogViewer } from './components/LogViewer';
import { ResultViewer } from './components/ResultViewer';
import { AuthPage } from './components/AuthPage';
import { AccountSettings } from './components/AccountSettings';
import { Library } from './components/Library';
import { AdminDashboard } from './components/AdminDashboard';

const App: React.FC = () => {
  // Application State
  const [user, setUser] = useState<User | null>(null);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [view, setView] = useState<'editor' | 'library' | 'settings' | 'admin'>('editor');

  // Editor State
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<TransformationLog[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentResultMeta, setCurrentResultMeta] = useState<HomeraAiRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');

  // Load User and Library from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('homera_ai_session');
    const storedLib = localStorage.getItem('homera_ai_library');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedLib) setSavedResults(JSON.parse(storedLib));
  }, []);

  // Persist User changes
  useEffect(() => {
    if (user) localStorage.setItem('homera_ai_session', JSON.stringify(user));
    else localStorage.removeItem('homera_ai_session');
  }, [user]);

  // Persist Library changes
  useEffect(() => {
    localStorage.setItem('homera_ai_library', JSON.stringify(savedResults));
  }, [savedResults]);


  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView(loggedInUser.role === 'admin' ? 'admin' : 'editor');
  };

  const handleLogout = () => {
    setUser(null);
    setView('editor');
    setFile(null);
    setImagePreview(null);
    setGeneratedImage(null);
    setLogs([]);
    localStorage.removeItem('homera_ai_session');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
    setGeneratedImage(null);
    setCurrentResultMeta(null);
    setLogs([]);
    setError(null);
  };

  const processRequest = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || prompt;
    if (!file || !promptToUse || !user) return;

    setError(null);
    setIsAnalyzing(true);
    setActiveTab('results');
    setLogs([]);
    setGeneratedImage(null);
    setCurrentResultMeta(null);

    const currentUserTier = user.tier;

    try {
      // Step 1: Interpret Request
      addLog({ title: 'Analyzing Request', message: `Interpreting user intent (Tier: ${currentUserTier})...`, status: 'loading' });
      
      const analysis = await interpretRequest(promptToUse, currentUserTier);
      
      addLog({ 
        title: 'Request Interpretation', 
        message: analysis.interpretation, 
        status: 'success',
        data: analysis.homera_ai_api_payload
      });

      setCurrentResultMeta(analysis);
      setIsAnalyzing(false);
      setIsGenerating(true);

      // Step 2: Execute Transformation
      addLog({ 
        title: 'Processing Visuals', 
        message: `Rendering with ${analysis.homera_ai_api_payload.quality.replace('_', ' ')} quality engine...`, 
        status: 'loading' 
      });

      addLog({
        title: 'Auto-Scaling',
        message: `Applying automatic upscale to ${analysis.homera_ai_api_payload.target_resolution}`,
        status: 'loading'
      });
      
      // Pass the target resolution to the execution function
      const resultBase64 = await executeTransformation(
        file, 
        analysis.homera_ai_api_payload.description,
        analysis.homera_ai_api_payload.target_resolution
      );
      
      setGeneratedImage(resultBase64);
      
      addLog({ title: 'Rendering Complete', message: 'Visualization generated successfully.', status: 'success' });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      addLog({ title: 'Error', message: errorMessage, status: 'error' });
    } finally {
      setIsAnalyzing(false);
      setIsGenerating(false);
    }
  };

  const handleSmartUpscale = () => {
    if (!file) return;
    setPrompt("Smart Upscale: Enhance resolution and quality");
    processRequest("Perform a smart AI upscale on this image. Increase resolution to maximum allowed. Denoise and sharpen.");
  };

  const addLog = (log: TransformationLog) => {
    setLogs(prev => [...prev, log]);
  };

  const saveToLibrary = () => {
    if (!user || !generatedImage || !imagePreview) return;

    const newItem: SavedResult = {
      id: Date.now().toString(),
      userId: user.uid,
      originalImage: imagePreview,
      generatedImage: generatedImage,
      prompt: prompt,
      date: new Date().toISOString(),
      quality: currentResultMeta?.homera_ai_api_payload.quality || 'STANDARD',
      resolution: currentResultMeta?.homera_ai_api_payload.target_resolution || '1920x1080',
      tierUsed: user.tier
    };

    setSavedResults(prev => [newItem, ...prev]);
  };

  const deleteFromLibrary = (id: string) => {
    setSavedResults(prev => prev.filter(item => item.id !== id));
  };

  const isSaved = generatedImage && savedResults.some(item => item.generatedImage === generatedImage);

  // AUTH STATE: Render AuthPage if no user
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const currentPlanName = subscriptionPlans.find(p => p.id === user.tier)?.name || user.tier;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-yellow-500/30 font-sans">
      <Header 
        user={user} 
        onLogoutClick={handleLogout}
        onLibraryClick={() => setView('library')}
        onHomeClick={() => setView('editor')}
        onSettingsClick={() => setView('settings')}
        activeView={view as any}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {view === 'admin' && <AdminDashboard currentUser={user} />}

        {/* VIEW: SETTINGS */}
        {view === 'settings' && (
          <AccountSettings user={user} onUpdateUser={handleUpdateUser} />
        )}
        
        {/* VIEW: LIBRARY */}
        {view === 'library' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-6 h-6 text-yellow-500" />
                My Library
              </h2>
              <span className="text-zinc-500 text-sm">{savedResults.length} items</span>
            </div>
            <Library items={savedResults} onDelete={deleteFromLibrary} />
          </div>
        )}

        {/* VIEW: EDITOR */}
        {view === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Controls & Input */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-yellow-500" />
                  Source Material
                </h2>
                <ImageUploader 
                  onFileSelect={handleFileSelect} 
                  currentPreview={imagePreview} 
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-yellow-500" />
                  Transformation Request
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Transform this living room into a minimalist Scandinavian style, remove the clutter on the coffee table, and make the lighting warmer."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none resize-none h-32 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => processRequest()}
                      disabled={!file || !prompt || isAnalyzing || isGenerating}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all
                        ${(!file || !prompt) 
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                          : 'bg-yellow-500 text-black hover:bg-yellow-400 active:transform active:scale-[0.98] shadow-lg shadow-yellow-500/20'
                        }
                        ${(isAnalyzing || isGenerating) ? 'opacity-75 cursor-wait' : ''}
                      `}
                    >
                      {isAnalyzing || isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      Generate
                    </button>

                    <button
                      onClick={handleSmartUpscale}
                      disabled={!file || isAnalyzing || isGenerating}
                      className={`py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all border
                        ${(!file) 
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                          : 'bg-zinc-900 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500'
                        }
                      `}
                      title="Use AI Super-Resolution without changing the design"
                    >
                      <Sparkles className="w-4 h-4" />
                      Smart Upscale
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-center text-zinc-500 mt-2">
                    Active Plan: <span className="text-yellow-500 font-medium">{currentPlanName}</span>
                  </div>
                </div>
              </div>

              {/* System Logs / JSON Output */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[400px]">
                <div className="bg-zinc-950/50 p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      System Logs
                    </h2>
                    <span className="text-xs text-zinc-600 font-mono">api/v1/transform</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <LogViewer logs={logs} />
                </div>
              </div>
            </div>

            {/* Right Column: Visualization */}
            <div className="lg:col-span-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-xl h-full min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                  <div className="flex gap-2 bg-zinc-950/50 p-1 rounded-lg">
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Original
                    </button>
                    <button 
                      onClick={() => setActiveTab('results')}
                      disabled={!generatedImage && !isGenerating}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'results' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Result
                    </button>
                  </div>
                  {generatedImage && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full font-medium border border-emerald-400/20">
                      <CheckCircle className="w-3 h-3" />
                      Render Complete
                    </span>
                  )}
                </div>

                <div className="flex-1 relative bg-zinc-950/30 m-2 rounded-lg border border-dashed border-zinc-800 flex items-center justify-center overflow-hidden">
                    {activeTab === 'upload' ? (
                      imagePreview ? (
                        <img src={imagePreview} alt="Original" className="max-h-full w-auto object-contain rounded shadow-2xl" />
                      ) : (
                        <div className="text-center text-zinc-600">
                          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>No source image uploaded</p>
                        </div>
                      )
                    ) : (
                      // Results Tab
                      isGenerating ? (
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-zinc-300 font-medium">Generating Visualization...</p>
                            <p className="text-zinc-500 text-sm mt-2">
                              {user.tier === 'ultra_realistic_16k' ? 'Rendering 16K Ultra-Realistic...' : user.tier === 'ultra_4k' ? 'Rendering 4K Details...' : 'Applying transformations...'}
                            </p>
                        </div>
                      ) : generatedImage ? (
                        <ResultViewer 
                          original={imagePreview} 
                          generated={generatedImage} 
                          onSave={saveToLibrary}
                          isSaved={isSaved}
                        />
                      ) : (
                        <div className="text-center text-zinc-600">
                          <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>Ready to generate</p>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;