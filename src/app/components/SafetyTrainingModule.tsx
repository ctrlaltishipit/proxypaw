import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle,
  Award,
  BookOpen,
  Shield,
  Heart,
  AlertTriangle,
  Play,
  Lock,
  User,
  Bell,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SafetyTrainingModuleProps {
  onBack: () => void;
  userRole: 'owner' | 'walker' | 'renter';
}

interface Module {
  id: number;
  title: string;
  description: string;
  icon: any;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface QuizQuestion {
  id: number;
  scenario: string;
  imageUrl: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function SafetyTrainingModule({ onBack, userRole }: SafetyTrainingModuleProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [currentView, setCurrentView] = useState<'overview' | 'quiz' | 'certification'>('overview');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [notifications] = useState(2);

  const modules: Module[] = [
    {
      id: 1,
      title: 'Body Language 101',
      description: 'Learn to read dog behavior, stress signals, and comfort zones',
      icon: BookOpen,
      duration: '15 min',
      completed: true,
      locked: false
    },
    {
      id: 2,
      title: 'Emergency Protocol',
      description: 'What to do in case of injury, aggression, or unexpected situations',
      icon: AlertTriangle,
      duration: '20 min',
      completed: true,
      locked: false
    },
    {
      id: 3,
      title: 'Safe Handling & Equipment',
      description: 'Proper leash techniques, harness fitting, and restraint methods',
      icon: Shield,
      duration: '12 min',
      completed: true,
      locked: false
    },
    {
      id: 4,
      title: 'Community Standards',
      description: 'Code of conduct, professionalism, and building trust',
      icon: Heart,
      duration: '10 min',
      completed: true,
      locked: false
    }
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      scenario: 'You approach a dog for the first scheduled walk. The dog displays the body language shown in the image.',
      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
      question: 'What does this dog\'s posture indicate?',
      options: [
        'The dog is relaxed and ready for interaction',
        'The dog is showing signs of fear or anxiety',
        'The dog is being playful and wants to run',
        'The dog is displaying dominance and aggression'
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      scenario: 'During a walk, the dog suddenly stops, lowers its body, and tucks its tail while another dog approaches.',
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
      question: 'What is the most appropriate action?',
      options: [
        'Encourage the dog to continue and meet the other dog',
        'Create distance and give the dog space to feel safe',
        'Pick up the dog immediately',
        'Let both dogs approach each other off-leash'
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      scenario: 'A dog in your care starts limping during a walk. There is no visible injury.',
      imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800',
      question: 'What should you do first?',
      options: [
        'Continue the walk at a slower pace',
        'Immediately stop, check the paw, and contact the owner',
        'Carry the dog for the rest of the walk',
        'Apply ice and continue walking'
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      scenario: 'The owner has left special instructions for their anxious dog, including: "Please avoid crowded areas."',
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
      question: 'You notice a busy dog park ahead. What do you do?',
      options: [
        'Walk through quickly to save time',
        'Take an alternate route respecting the owner\'s instructions',
        'Enter the park but keep the dog on a short leash',
        'Call the owner to ask if you can go through'
      ],
      correctAnswer: 1
    }
  ];

  const totalQuestions = quizQuestions.length;
  const completedModules = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const overallProgress = (completedModules / totalModules) * 100;

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const passingScore = 75;
  const finalScore = quizCompleted ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = finalScore >= passingScore;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      setCurrentView('certification');
    }
  };

  const startQuiz = () => {
    setCurrentView('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
  };

  const retakeQuiz = () => {
    setCurrentView('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
      {/* Header */}
      <div className={`border-b sticky top-0 z-40 backdrop-blur-sm ${isLightMode ? 'border-gray-200 bg-white/80' : 'border-gray-800 bg-gray-900/80'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className={`flex items-center gap-2 transition-colors ${isLightMode ? 'hover:text-gray-600' : 'hover:text-gray-300'}`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className={`relative p-2 rounded-sm transition-colors ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button className={`p-2 rounded-sm transition-colors ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {currentView === 'overview' && (
          <>
            {/* Page Title */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="mb-2">Volunteer Safety Training</h1>
              <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>Complete all modules to earn your certification and start volunteering</p>
            </motion.div>

            {/* Overall Progress */}
            <motion.div 
              className={`mb-12 border rounded-sm p-8 ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className={`w-6 h-6 ${isLightMode ? 'text-gray-900' : 'text-gray-300'}`} />
                  <h2>Your Training Progress</h2>
                </div>
                <span className={isLightMode ? 'text-gray-900' : 'text-gray-300'}>{completedModules} / {totalModules} Modules</span>
              </div>
              
              <div className={`h-4 rounded-full overflow-hidden mb-4 ${isLightMode ? 'bg-gray-200' : 'bg-gray-700'}`}>
                <motion.div 
                  className={`h-full ${isLightMode ? 'bg-gray-900' : 'bg-gray-300'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>

              <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                {overallProgress === 100 
                  ? 'All modules complete! Ready for certification quiz.' 
                  : `${totalModules - completedModules} module(s) remaining`}
              </p>
            </motion.div>

            {/* Training Modules */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  className={`border rounded-sm p-6 transition-colors ${
                    module.locked 
                      ? isLightMode ? 'border-gray-200 opacity-50' : 'border-gray-800 opacity-50'
                      : module.completed 
                      ? isLightMode ? 'border-emerald-500/50 bg-emerald-50' : 'border-emerald-500/30 bg-emerald-500/5'
                      : isLightMode ? 'border-gray-300 hover:border-gray-900' : 'border-gray-800 hover:border-gray-600'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-sm ${
                      module.completed ? 'bg-emerald-500' : isLightMode ? 'bg-gray-200' : 'bg-gray-800'
                    }`}>
                      {module.locked ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        <module.icon className={`w-6 h-6 ${module.completed ? 'text-white' : ''}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3>{module.title}</h3>
                        {module.completed && (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <p className={`mb-3 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{module.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={isLightMode ? 'text-gray-500' : 'text-gray-500'}>{module.duration}</span>
                        {!module.locked && !module.completed && (
                          <button className={`flex items-center gap-2 transition-colors ${isLightMode ? 'text-gray-900 hover:text-gray-700' : 'text-gray-300 hover:text-white'}`}>
                            <Play className="w-4 h-4" />
                            Start Module
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Final Certification Quiz */}
            <motion.div
              className={`border rounded-sm p-8 ${
                overallProgress === 100 
                  ? isLightMode ? 'border-gray-900 bg-gray-50' : 'border-gray-600 bg-gray-800'
                  : isLightMode ? 'border-gray-200 opacity-50' : 'border-gray-700 opacity-50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-sm ${
                  overallProgress === 100 ? isLightMode ? 'bg-gray-900' : 'bg-gray-700' : isLightMode ? 'bg-gray-200' : 'bg-gray-800'
                }`}>
                  <Award className={`w-8 h-8 ${overallProgress === 100 ? 'text-white' : ''}`} />
                </div>
                <div className="flex-1">
                  <h2 className="mb-2">Final Certification Quiz</h2>
                  <p className={`mb-6 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    Take the AI-driven scenario-based assessment to earn your official Proxypaw Volunteer Certification. 
                    You must score {passingScore}% or higher to pass.
                  </p>
                  
                  {overallProgress === 100 ? (
                    <button 
                      onClick={startQuiz}
                      className={`px-6 py-3 transition-colors rounded-sm flex items-center gap-2 ${isLightMode ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'}`}
                    >
                      Begin Certification Quiz
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className={`flex items-center gap-2 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Lock className="w-4 h-4" />
                      <span>Complete all modules to unlock</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {currentView === 'quiz' && (
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Quiz Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2>Certification Quiz</h2>
                <span className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isLightMode ? 'bg-gray-200' : 'bg-gray-800'}`}>
                <motion.div 
                  className={`h-full ${isLightMode ? 'bg-gray-900' : 'bg-gray-300'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className={`border rounded-sm p-8 mb-6 ${isLightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
              {/* Scenario */}
              <div className={`mb-6 p-4 border rounded-sm ${isLightMode ? 'bg-gray-50 border-gray-300' : 'bg-gray-900 border-gray-700'}`}>
                <p className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>{currentQuestion.scenario}</p>
              </div>

              {/* Image/Video Placeholder */}
              <div className={`mb-6 border rounded-sm overflow-hidden ${isLightMode ? 'bg-gray-100 border-gray-200' : 'bg-black border-gray-800'}`}>
                <img 
                  src={currentQuestion.imageUrl}
                  alt="Scenario visualization"
                  className="w-full h-80 object-cover"
                />
              </div>

              {/* Question */}
              <h3 className="mb-6">{currentQuestion.question}</h3>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left px-6 py-4 rounded-sm border transition-all ${
                      selectedAnswer === index
                        ? isLightMode ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-white text-gray-900'
                        : isLightMode ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index 
                          ? isLightMode ? 'border-white bg-white' : 'border-gray-900 bg-gray-900'
                          : isLightMode ? 'border-gray-400' : 'border-gray-500'
                      }`}>
                        {selectedAnswer === index && (
                          <div className={`w-3 h-3 rounded-full ${isLightMode ? 'bg-gray-900' : 'bg-white'}`} />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentView('overview')}
                className={`px-6 py-3 border rounded-sm transition-colors ${isLightMode ? 'border-gray-300 hover:border-gray-400' : 'border-gray-700 hover:border-gray-600'}`}
              >
                Exit Quiz
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className={`px-6 py-3 rounded-sm flex items-center gap-2 transition-colors ${
                  selectedAnswer === null
                    ? isLightMode ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : isLightMode ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'
                }`}
              >
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Submit Quiz'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {currentView === 'certification' && (
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={`border rounded-sm p-12 text-center ${
              passed 
                ? isLightMode ? 'border-emerald-500/50 bg-emerald-50' : 'border-emerald-500/30 bg-emerald-500/10'
                : isLightMode ? 'border-red-500/50 bg-red-50' : 'border-red-500/30 bg-red-500/10'
            }`}>
              {/* Icon */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                passed ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {passed ? (
                  <Award className="w-12 h-12 text-white" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-white" />
                )}
              </div>

              {/* Status */}
              <h1 className="mb-4">
                {passed ? 'Certified Volunteer!' : 'Retraining Required'}
              </h1>

              {/* Score */}
              <div className="mb-6">
                <div className="text-6xl mb-2">
                  <span className={passed ? 'text-emerald-400' : 'text-red-400'}>
                    {finalScore}%
                  </span>
                </div>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  You answered {score} out of {totalQuestions} questions correctly
                </p>
              </div>

              {/* Message */}
              <div className="max-w-md mx-auto mb-8">
                {passed ? (
                  <p className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>
                    Congratulations! You&apos;ve successfully completed the Proxypaw Volunteer Safety Training. 
                    Your certification is now active and you can start accepting walk requests.
                  </p>
                ) : (
                  <p className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>
                    You need {passingScore}% to pass. Please review the training modules and retake the quiz. 
                    Don&apos;t worry—you can retake it as many times as needed.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {passed ? (
                  <>
                    <button 
                      onClick={onBack}
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-sm text-white"
                    >
                      Go to Dashboard
                    </button>
                    <button className={`px-8 py-4 border rounded-sm transition-colors ${isLightMode ? 'border-gray-300 hover:border-gray-400' : 'border-gray-700 hover:border-gray-600'}`}>
                      Download Certificate
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={retakeQuiz}
                      className={`px-8 py-4 transition-colors rounded-sm ${isLightMode ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'}`}
                    >
                      Retake Quiz
                    </button>
                    <button 
                      onClick={() => setCurrentView('overview')}
                      className={`px-8 py-4 border rounded-sm transition-colors ${isLightMode ? 'border-gray-300 hover:border-gray-400' : 'border-gray-700 hover:border-gray-600'}`}
                    >
                      Review Modules
                    </button>
                  </>
                )}
              </div>

              {/* AI Assessment Note */}
              <div className={`mt-8 pt-8 border-t ${isLightMode ? 'border-gray-200' : 'border-gray-800'}`}>
                <p className={isLightMode ? 'text-gray-500' : 'text-gray-500'}>
                  <Shield className="w-4 h-4 inline mr-2" />
                  This certification is valid for 12 months. AI-powered assessment ensures scenario-based competency.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}