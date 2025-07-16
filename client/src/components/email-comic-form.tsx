import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { comicsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, ArrowLeft, CheckCircle } from "lucide-react";

interface EmailComicFormProps {
  imageUrl: string;
  storyTitle: string;
  storyDescription: string;
  characters: Array<{
    name: string;
    appearance: string;
    personality: string;
    role: string;
  }>;
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function EmailComicForm({
  imageUrl,
  storyTitle,
  storyDescription,
  characters,
  onBack,
  onSuccess
}: EmailComicFormProps) {
  const [childName, setChildName] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const emailMutation = useMutation({
    mutationFn: comicsApi.emailComic,
    onSuccess: (result) => {
      setEmailSent(true);
      toast({
        title: "📧 Comic emailed successfully!",
        description: "Your amazing comic has been sent to your email inbox!",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "Could not send the comic via email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!childName.trim()) {
      toast({
        title: "Please enter your name",
        description: "We need your name to personalize the email!",
        variant: "destructive",
      });
      return;
    }

    if (!parentEmail.trim()) {
      toast({
        title: "Please enter an email address",
        description: "We need an email address to send your comic!",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (childEmail && !emailRegex.test(childEmail)) {
      toast({
        title: "Invalid child email address",
        description: "Please enter a valid email address or leave it empty.",
        variant: "destructive",
      });
      return;
    }

    emailMutation.mutate({
      childName: childName.trim(),
      childEmail: childEmail.trim() || undefined,
      parentEmail: parentEmail.trim(),
      storyTitle,
      storyDescription,
      characters,
      imageUrl,
    });
  };

  if (emailSent) {
    return (
      <Card className="max-w-md mx-auto comic-border bg-gradient-to-br from-comic-green to-comic-blue">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-comic text-2xl text-white mb-4">
            Success!
          </h2>
          <div className="bg-white/90 p-4 rounded-lg comic-border mb-6">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-comic-green mr-2" />
              <span className="font-bold text-lg">Email Sent!</span>
            </div>
            <p className="text-gray-700">
              Your comic has been sent to <strong>{parentEmail}</strong>
              {childEmail && (
                <span> and <strong>{childEmail}</strong></span>
              )}
            </p>
          </div>
          <div className="space-y-3">
            {onBack && (
              <Button
                onClick={onBack}
                className="w-full bg-white text-comic-blue hover:bg-gray-100 comic-border font-bold"
              >
                ✨ Create Another Comic
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto comic-border bg-gradient-to-br from-comic-yellow to-comic-orange">
      <CardHeader className="text-center">
        <CardTitle className="font-comic text-2xl text-gray-800 flex items-center justify-center">
          <Mail className="w-6 h-6 mr-2" />
          📧 Email Your Comic!
        </CardTitle>
        <p className="text-gray-700">
          Enter your details to receive your amazing comic via email!
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Comic Preview */}
        <div className="mb-6 text-center">
          <div className="bg-white p-3 rounded-lg comic-border shadow-lg">
            <img
              src={imageUrl}
              alt="Your comic"
              className="w-full h-auto rounded max-h-40 object-contain"
            />
            <p className="text-sm font-bold text-gray-800 mt-2">
              "{storyTitle}"
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="childName" className="text-lg font-bold text-gray-800">
              Your Name *
            </Label>
            <Input
              id="childName"
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Enter your name..."
              className="comic-border comic-input-focus text-lg"
              required
            />
          </div>

          <div>
            <Label htmlFor="parentEmail" className="text-lg font-bold text-gray-800">
              Email Address *
            </Label>
            <Input
              id="parentEmail"
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="Enter email address..."
              className="comic-border comic-input-focus text-lg"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              💡 This is where we'll send your comic!
            </p>
          </div>

          <div>
            <Label htmlFor="childEmail" className="text-lg font-bold text-gray-800">
              Your Email (Optional)
            </Label>
            <Input
              id="childEmail"
              type="email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              placeholder="Your email (if you have one)..."
              className="comic-border comic-input-focus text-lg"
            />
            <p className="text-sm text-gray-600 mt-1">
              📧 We'll send a copy here too if you want!
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            {onBack && (
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1 comic-border hover:bg-gray-100 font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={emailMutation.isPending}
              className="flex-1 bg-comic-purple text-white hover:bg-comic-purple/80 comic-border font-bold text-lg py-3"
            >
              {emailMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2">📧</div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  📧 Send Comic!
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-3 bg-white/80 rounded-lg comic-border">
          <p className="text-sm text-gray-700 text-center">
            🌟 <strong>Your comic will include:</strong><br />
            • The amazing comic you created<br />
            • Story title: "{storyTitle}"<br />
            • All your character details<br />
            • Sent to you instantly! ⚡
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
