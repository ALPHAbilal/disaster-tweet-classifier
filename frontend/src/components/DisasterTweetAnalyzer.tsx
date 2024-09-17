import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Twitter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const disasterTypes = ['Earthquake', 'Flood', 'Wildfire', 'Hurricane', 'Terrorist Attack']

const exampleTweets = {
  emergency: [
    "Just felt a huge earthquake! Buildings are shaking. #earthquake",
    "Massive flooding in downtown, cars submerged. Need help! #flood",
    "Wildfire spreading rapidly towards residential areas. Evacuate now! #wildfire"
  ],
  nonEmergency: [
    "Can't wait to see the new disaster movie at the cinema tonight!",
    "This coffee shop's prices are a disaster for my wallet. #expensive",
    "My team's performance was a complete disaster. We need to improve. #sports"
  ]
}

export default function DisasterTweetAnalyzer() {
  const [tweet, setTweet] = useState('')
  const [result, setResult] = useState<null | { isEmergency: boolean; confidence: number; disasterType: string; explanation: string }>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweet }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResult({
        isEmergency: data.prediction === 'Disaster',
        confidence: data.confidence,
        disasterType: data.prediction === 'Disaster' ? 'Unknown' : 'None',
        explanation: data.prediction === 'Disaster' 
          ? 'This tweet contains patterns typically associated with disaster situations.'
          : 'This tweet lacks urgent language and specific details typically found in emergency reports.',
      });
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getAlertLevel = (confidence: number) => {
    if (confidence > 0.8) return 'High'
    if (confidence > 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Real-Time Twitter Emergency Detection</CardTitle>
        <CardDescription>
          Test our AI model designed to identify emergency situations from tweets.
          Helps disaster relief organizations and news agencies monitor real-time crisis reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
            <label htmlFor="tweet" className="text-sm font-medium leading-none flex items-center text-blue-800">
              <Twitter className="w-4 h-4 mr-2" />
              Enter a tweet to analyze
            </label>
            <Textarea
              id="tweet"
              placeholder="Type or paste a tweet here (max 280 characters)"
              value={tweet}
              onChange={(e) => setTweet(e.target.value.slice(0, 280))}
              required
              className="min-h-[100px] border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
            <div className="flex justify-between text-sm text-blue-600">
              <span>{tweet.length} / 280 characters</span>
              {tweet.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTweet('')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || tweet.length === 0}>
            {isLoading ? 'Analyzing...' : 'Analyze Tweet'}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className={`flex items-center space-x-2 ${result.isEmergency ? 'text-red-500' : 'text-green-500'}`}>
              {result.isEmergency ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
              <span className="font-medium text-lg">
                {result.isEmergency ? 'Emergency Detected' : 'No Emergency Detected'}
              </span>
            </div>
            <div>
              <p className="font-medium">Disaster Type: {result.disasterType}</p>
              <p className="text-sm text-gray-600 mt-1">{result.explanation}</p>
            </div>
            <div>
              <p className="font-medium">Confidence: {(result.confidence * 100).toFixed(2)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className={`h-2.5 rounded-full ${result.isEmergency ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="font-medium">Alert Level: 
                <Badge 
                  variant={result.isEmergency ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {getAlertLevel(result.confidence)}
                </Badge>
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {error && (
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        <div className="mt-4 w-full">
          <p className="font-medium mb-2">Example Tweets:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-sm mb-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 text-red-500" /> Emergency
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {exampleTweets.emergency.map((tweet, index) => (
                  <li key={index}>{tweet}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm mb-1 flex items-center">
                <Info className="h-4 w-4 mr-1 text-blue-500" /> Non-Emergency
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {exampleTweets.nonEmergency.map((tweet, index) => (
                  <li key={index}>{tweet}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
