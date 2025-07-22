import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Send, 
  User, 
  LogOut, 
  History,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { storageUtils } from '@/utils/storage';
import { mockOpenAISearch } from '@/services/mockOpenAI';
import { Question, Submission, SearchResponse, User as UserType } from '@/types';
import questionsData from '@/data/questions.json';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<UserType | null>(null);
  const [questions] = useState<Question[]>(questionsData as Question[]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userHistory, setUserHistory] = useState<Submission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = storageUtils.getUser();
    if (!currentUser || !storageUtils.isLoggedIn()) {
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    setUserHistory(storageUtils.getUserSubmissions(currentUser.id));
  }, [navigate]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await mockOpenAISearch(searchQuery);
      setSearchResponse(response);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to get search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !searchResponse || !user) {
      toast({
        title: "Missing Information",
        description: "Please search for information before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const submission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      gptAnswer: searchResponse.answer,
      userId: user.id,
      timestamp: new Date().toISOString()
    };

    try {
      storageUtils.addSubmission(submission);
      setUserHistory(prev => [submission, ...prev]);
      
      toast({
        title: "Submission Successful",
        description: "Your query evaluation has been recorded.",
      });

      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSearchQuery('');
        setSearchResponse(null);
      }
    } catch (error) {
      toast({
        title: "Submission Error", 
        description: "Failed to record submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    storageUtils.logout();
    navigate('/');
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
    setSearchQuery('');
    setSearchResponse(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Query Evaluation Platform</h1>
                <p className="text-sm text-muted-foreground">CPM-15316 Research Interface</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User History */}
        {userHistory.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Your Recent Submissions</span>
              </CardTitle>
              <CardDescription>
                {userHistory.length} queries evaluated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userHistory.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{submission.question}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-success ml-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Interface */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Questions */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                <Badge variant="secondary">{currentQuestion?.category}</Badge>
              </div>
              <CardDescription>
                Difficulty: <Badge variant={
                  currentQuestion?.difficulty === 'easy' ? 'secondary' : 
                  currentQuestion?.difficulty === 'medium' ? 'default' : 'destructive'
                }>
                  {currentQuestion?.difficulty}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg border-l-4 border-primary">
                <p className="text-foreground leading-relaxed">{currentQuestion?.question}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigateQuestion('prev')}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => navigateQuestion('next')}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - OpenAI Search */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>AI-Powered Search</span>
              </CardTitle>
              <CardDescription>
                Search for relevant information using OpenAI GPT-4
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter your search query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResponse && (
                <div className="space-y-3">
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <Textarea
                      value={searchResponse.answer}
                      readOnly
                      className="min-h-[120px] resize-none bg-transparent border-none p-0 focus:ring-0"
                    />
                  </div>
                  
                  {searchResponse.sources && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Sources:</strong> {searchResponse.sources.join(', ')}
                    </div>
                  )}
                  
                  {searchResponse.confidence && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Confidence:</strong> {Math.round(searchResponse.confidence * 100)}%
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!searchResponse || isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-accent to-success hover:shadow-lg transition-all duration-300 px-8"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            {isSubmitting ? 'Recording Submission...' : 'Submit Query Evaluation'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;