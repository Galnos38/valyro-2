import { useState, useCallback } from 'react';
import type { Screen, Analysis, AlertItem } from '@/types';
import { analyzeProduct, analyzeFromText, sampleProducts } from '@/lib/engine';
import { HomeScreen } from '@/screens/HomeScreen';
import { AnalysisScreen } from '@/screens/AnalysisScreen';
import { CompareScreen } from '@/screens/CompareScreen';
import { AlertsScreen } from '@/screens/AlertsScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { BottomNav } from '@/components/BottomNav';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [compareList, setCompareList] = useState<Analysis[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const runAnalysis = useCallback((analysis: Analysis) => {
    setCurrentAnalysis(analysis);
    setHistory((prev) => [analysis, ...prev].slice(0, 50));
    setScreen('analysis');
  }, []);

  const handleAnalyze = useCallback((query: string) => {
    runAnalysis(analyzeFromText(query));
  }, [runAnalysis]);

  const handleQuickAnalyze = useCallback((productId: string) => {
    const product = sampleProducts.find((p) => p.id === productId);
    if (product) runAnalysis(analyzeProduct(product));
  }, [runAnalysis]);

  const handleSetAlert = useCallback((analysis: Analysis) => {
    const alert: AlertItem = {
      id: `alert-${Date.now()}`,
      productTitle: analysis.title,
      image: analysis.image,
      message: 'Vous serez notifié dès qu\'une meilleure offre apparaît.',
      newScore: analysis.score,
      oldScore: analysis.score,
      newPrice: analysis.askPrice,
      oldPrice: analysis.askPrice,
      createdAt: Date.now(),
      read: false,
    };
    setAlerts((prev) => [alert, ...prev]);
    setScreen('alerts');
  }, []);

  const handleAddToCompare = useCallback((analysis: Analysis) => {
    setCompareList((prev) => {
      if (prev.some((a) => a.id === analysis.id)) return prev;
      return [...prev, analysis];
    });
    setScreen('compare');
  }, []);

  const handleRemoveFromCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleDismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const alertCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-slate-950 max-w-md mx-auto relative">
      {screen === 'home' && (
        <HomeScreen
        onAnalyze={handleAnalyze}
        onAnalyzeProduct={(productName, price) => handleAnalyze(`${productName} ${price}€`)}
        onQuickAnalyze={handleQuickAnalyze}
      />
      )}
      {screen === 'analysis' && currentAnalysis && (
        <AnalysisScreen
          analysis={currentAnalysis}
          onBack={() => setScreen('home')}
          onCompare={handleAddToCompare}
          onSetAlert={handleSetAlert}
        />
      )}
      {screen === 'compare' && (
        <CompareScreen
          analyses={compareList}
          onBack={() => setScreen('home')}
          onAdd={() => setScreen('home')}
          onRemove={handleRemoveFromCompare}
        />
      )}
      {screen === 'alerts' && (
        <AlertsScreen alerts={alerts} onDismiss={handleDismissAlert} />
      )}
      {screen === 'history' && (
        <HistoryScreen history={history} onSelect={runAnalysis} />
      )}
      <BottomNav active={screen} onNavigate={setScreen} alertCount={alertCount} />
    </div>
  );
}

export default App;
