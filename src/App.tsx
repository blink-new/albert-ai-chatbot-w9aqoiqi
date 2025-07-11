import { useState, useEffect, useRef } from 'react'
import { blink } from './blink/client'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card } from './components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar'
import { ScrollArea } from './components/ui/scroll-area'
import { Dialog, DialogContent, DialogTitle } from './components/ui/dialog'
import { Textarea } from './components/ui/textarea'
import { TicTacToe, GameState } from './components/TicTacToe'
import { Send, Book, User, Loader2, Image, Video, Camera, Film, Settings as SettingsIcon, Gamepad2, RefreshCw } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  type?: 'text' | 'image' | 'video' | 'game'
  mediaUrl?: string
}

const MODES = [
  { key: 'assistant', label: 'Assistant', description: 'Helpful, friendly, and professional.' },
  { key: 'gamer', label: 'Gamer', description: 'Fun, energetic, and uses gaming slang.' },
  { key: 'bookworm', label: 'Bookworm', description: 'Loves books, uses literary references, and is a bit nerdy.' },
] as const;
type ModeKey = typeof MODES[number]['key'];

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Albert, your AI assistant. How can I help you today? I can chat with you, create images, or even play games with you!",
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [isCreatingImage, setIsCreatingImage] = useState(false)
  const [isCreatingVideo, setIsCreatingVideo] = useState(false)
  const [mode, setMode] = useState<ModeKey>('assistant')
  const [showSettings, setShowSettings] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [albertNextMove, setAlbertNextMove] = useState<number | undefined>(undefined)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getModePrompt = () => {
    switch (mode) {
      case 'gamer':
        return "You are Albert, an AI chatbot with a fun, energetic, and gaming-inspired personality. Use gaming slang, memes, and references. Be witty and playful."
      case 'bookworm':
        return "You are Albert, an AI chatbot who loves books and literature. Use literary references, quotes, and a nerdy, thoughtful tone. Be insightful and a bit whimsical."
      case 'assistant':
      default:
        return "You are Albert, a helpful, friendly, and professional AI assistant. Respond in a clear, concise, and supportive way."
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const { text } = await blink.ai.generateText({
        prompt: `${getModePrompt()} User message: "${input}"`,
        model: 'gpt-4o-mini',
        maxTokens: 500
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const createImage = async () => {
    if (!imagePrompt.trim()) return

    setIsCreatingImage(true)

    try {
      const { data } = await blink.ai.generateImage({
        prompt: imagePrompt,
        size: '1024x1024',
        quality: 'high',
        n: 1
      })

      const imageMessage: Message = {
        id: Date.now().toString(),
        content: `Generated image: "${imagePrompt}"`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'image',
        mediaUrl: data[0].url
      }

      setMessages(prev => [...prev, imageMessage])
      setImagePrompt('')
    } catch (error) {
      console.error('Error generating image:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error creating the image. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsCreatingImage(false)
      setShowImageDialog(false)
    }
  }

  const createVideo = async () => {
    if (!videoPrompt.trim()) return

    setIsCreatingVideo(true)

    try {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Video generation is coming soon! For now, I can create amazing images for you.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setVideoPrompt('')
    } catch (error) {
      console.error('Error generating video:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error creating the video. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsCreatingVideo(false)
      setShowVideoDialog(false)
    }
  }

  const handleImagePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImagePrompt(e.target.value)
  }

  const handleVideoPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVideoPrompt(e.target.value)
  }

  const startTicTacToe = () => {
    setShowGame(true)
    setAlbertNextMove(undefined)
    
    const gameStartMessage: Message = {
      id: Date.now().toString(),
      content: mode === 'gamer' ? "Let's play some Tic Tac Toe! You're X, I'm O. Let's see what you got! 🎮" : "Let's play Tic Tac Toe! You'll be X and I'll be O. Good luck! 🎯",
      role: 'assistant',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, gameStartMessage])
  }

  const newChat = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm Albert, your AI assistant. How can I help you today? I can chat with you, create images, or even play games with you!",
        role: 'assistant',
        timestamp: new Date()
      }
    ])
    setInput('')
  }

  const handleGameMove = (gameState: GameState) => {
    if (gameState.currentPlayer === 'O' && !gameState.gameOver) {
      // Albert's AI logic for tic tac toe
      const getAlbertMove = (board: (string | null)[]): number => {
        // Check for winning moves
        for (let i = 0; i < 9; i++) {
          if (!board[i]) {
            const testBoard = [...board]
            testBoard[i] = 'O'
            if (checkWinner(testBoard) === 'O') return i
          }
        }
        
        // Block player's winning moves
        for (let i = 0; i < 9; i++) {
          if (!board[i]) {
            const testBoard = [...board]
            testBoard[i] = 'X'
            if (checkWinner(testBoard) === 'X') return i
          }
        }
        
        // Take center if available
        if (!board[4]) return 4
        
        // Take corners
        const corners = [0, 2, 6, 8]
        for (const corner of corners) {
          if (!board[corner]) return corner
        }
        
        // Take any available spot
        for (let i = 0; i < 9; i++) {
          if (!board[i]) return i
        }
        
        return -1
      }

      setTimeout(() => {
        const move = getAlbertMove(gameState.board)
        if (move !== -1) {
          setAlbertNextMove(move)
        }
      }, 1000) // Albert thinks for 1 second
    }
  }

  const checkWinner = (board: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  const handleGameEnd = (result: 'win' | 'lose' | 'draw') => {
    let response = ''
    switch (result) {
      case 'win':
        response = mode === 'gamer' ? "GG! You got me this time! 🎮" : "Congratulations! Well played! 🎉"
        break
      case 'lose':
        response = mode === 'gamer' ? "BOOM! I got you! Want a rematch? 😎" : "I won this round! Great game though! 🤖"
        break
      case 'draw':
        response = mode === 'gamer' ? "It's a tie! We're both pros! 🤝" : "A draw! We're evenly matched! 🤝"
        break
    }
    
    const gameEndMessage: Message = {
      id: Date.now().toString(),
      content: response,
      role: 'assistant',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, gameEndMessage])
    setAlbertNextMove(undefined)
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-cover bg-center bg-fixed relative" 
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1699791915483-3241feffc8fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHxCcml0aXNoJTIwY2FzdGxlJTIwbWVkaWV2YWwlMjBzdG9uZSUyMGZvcnRyZXNzfGVufDB8MHx8fDE3NTIyMTQwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080')`
        }}
      >
        <Card className="p-8 max-w-md mx-auto text-center bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <div className="flex items-center justify-center mb-4">
            <Book className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Albert AI</h1>
          <p className="text-gray-600 mb-4">Sign in to chat with your AI assistant</p>
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </Card>
      </div>
    )
  }

  // MAIN CHAT UI
  return (
    <div 
      className="flex flex-col h-screen bg-cover bg-center bg-fixed relative" 
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1699791915483-3241feffc8fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHxCcml0aXNoJTIwY2FzdGxlJTIwbWVkaWV2YWwlMjBzdG9uZSUyMGZvcnRyZXNzfGVufDB8MHx8fDE3NTIyMTQwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080')`
      }}
    >
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="Albert" />
              <AvatarFallback className="bg-blue-600 text-white">
                <Book className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Albert</h1>
              <p className="text-sm text-gray-500">AI <span className="font-bold text-blue-700">{MODES.find(m => m.key === mode)?.label}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={newChat}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              <SettingsIcon className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md mx-auto">
          <DialogTitle className="text-lg font-bold text-gray-900 mb-4">Albert Settings</DialogTitle>
          <div className="space-y-4">
            {MODES.map((m) => (
              <Button
                key={m.key}
                variant={mode === m.key ? 'default' : 'outline'}
                className={`w-full flex flex-col items-start text-left p-4 h-auto ${mode === m.key ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => { setMode(m.key as ModeKey); setShowSettings(false); }}
              >
                <span className="font-semibold text-base">{m.label}</span>
                <span className="text-sm opacity-75 mt-1">{m.description}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full p-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg h-full p-4">
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 mt-2">
                        <AvatarImage src="" alt="Albert" />
                        <AvatarFallback className="bg-blue-600 text-white">
                          <Book className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 shadow-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white ml-12 backdrop-blur-sm'
                          : 'bg-white/95 text-gray-900 mr-12 border backdrop-blur-sm'
                      }`}
                    >
                      {message.type === 'image' && (
                        <img
                          src={message.mediaUrl}
                          alt={`Generated image: "${message.content}"`}
                          className="w-full h-40 object-cover rounded-2xl mb-2"
                        />
                      )}
                      {message.type === 'video' && (
                        <video
                          src={message.mediaUrl}
                          controls
                          className="w-full h-40 object-cover rounded-2xl mb-2"
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 mt-2">
                        <AvatarFallback className="bg-gray-600 text-white text-sm">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start space-x-3 justify-start">
                    <Avatar className="h-8 w-8 mt-2">
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        <Book className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/95 text-gray-900 mr-12 border rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-500">Albert is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-200/50 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to Albert..."
                className="pr-20 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => setShowImageDialog(true)}
              size="sm"
              className="rounded-full h-10 w-10 p-0 bg-green-600 hover:bg-green-700"
              title="I would like to make an image"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setShowVideoDialog(true)}
              size="sm"
              className="rounded-full h-10 w-10 p-0 bg-purple-600 hover:bg-purple-700"
              title="I would like to make a video"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
              onClick={startTicTacToe}
              size="sm"
              className="rounded-full h-10 w-10 p-0 bg-yellow-600 hover:bg-yellow-700"
              title="Play Tic Tac Toe"
            >
              <Gamepad2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Albert can make mistakes. Please verify important information.
          </p>
        </div>
      </div>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogTitle className="text-lg font-bold text-gray-900 mb-4">Create Image</DialogTitle>
          <div className="space-y-4">
            <Textarea
              value={imagePrompt}
              onChange={handleImagePromptChange}
              placeholder="Describe the image you want to create..."
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setShowImageDialog(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={createImage}
                disabled={isCreatingImage || !imagePrompt.trim()}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {isCreatingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Create Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogTitle className="text-lg font-bold text-gray-900 mb-4">Create Video</DialogTitle>
          <div className="space-y-4">
            <Textarea
              value={videoPrompt}
              onChange={handleVideoPromptChange}
              placeholder="Describe the video you want to create..."
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setShowVideoDialog(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={createVideo}
                disabled={isCreatingVideo || !videoPrompt.trim()}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isCreatingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Film className="h-4 w-4 mr-2" />
                    Create Video
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tic Tac Toe Game Dialog */}
      <Dialog open={showGame} onOpenChange={setShowGame}>
        <DialogContent className="max-w-md mx-auto">
          <DialogTitle className="text-lg font-bold text-gray-900 mb-4">Tic Tac Toe with Albert</DialogTitle>
          <div className="space-y-4">
            <TicTacToe
              onMove={handleGameMove}
              onGameEnd={handleGameEnd}
              albertMove={albertNextMove}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App