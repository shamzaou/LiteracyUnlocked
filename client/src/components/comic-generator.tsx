import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { comicsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Share2, RotateCcw, Edit3 } from "lucide-react";
import ComicEditor from "./comic-editor";
import type { Story, Character, Comic } from "@shared/schema";

interface ComicGeneratorProps {
  stories: Story[];
  characters: Character[];
}

export default function ComicGenerator({ stories, characters }: ComicGeneratorProps) {
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  const [generatedComic, setGeneratedComic] = useState<Comic | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();

  const generateComicMutation = useMutation({
    mutationFn: comicsApi.generate,
    onSuccess: (comic) => {
      setGeneratedComic(comic);
      toast({
        title: "Comic generated! 🎉",
        description: "Your amazing comic is ready to view and download!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating comic",
        description: error instanceof Error ? error.message : "Failed to generate comic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedStory = stories.find(story => story.id === parseInt(selectedStoryId));
  const storyCharacters = selectedStory ? 
    characters.filter(char => selectedStory.characterIds.includes(char.id)) : [];

  const getRoleEmoji = (role: string) => {
    switch (role) {
      case "hero": return "🦸";
      case "villain": return "😈";
      case "friend": return "👫";
      case "helper": return "🤝";
      case "pet": return "🐕";
      default: return "🌟";
    }
  };

  const handleGenerateComic = () => {
    if (!selectedStoryId) {
      toast({
        title: "Please select a story",
        description: "Choose a story to turn into a comic!",
        variant: "destructive",
      });
      return;
    }

    generateComicMutation.mutate(parseInt(selectedStoryId));
  };

  const handleDownload = async () => {
    if (!generatedComic) return;

    try {
      const response = await fetch(generatedComic.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comic-${generatedComic.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Comic downloaded! 💾",
        description: "Your comic has been saved to your device.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the comic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!generatedComic) return;

    if (navigator.share) {
      try {
        const response = await fetch(generatedComic.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `comic-${generatedComic.id}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'My Amazing Comic!',
          text: 'Check out this comic I created!',
          files: [file],
        });
      } catch (error) {
        // Fallback to copying URL
        await navigator.clipboard.writeText(generatedComic.imageUrl);
        toast({
          title: "Comic URL copied! 🚀",
          description: "Share the link with your friends!",
        });
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(generatedComic.imageUrl);
      toast({
        title: "Comic URL copied! 🚀",
        description: "Share the link with your friends!",
      });
    }
  };
  const handleTryAgain = () => {
    setGeneratedComic(null);
    setShowEditor(false);
  };

  const handleEditComic = () => {
    setShowEditor(true);
  };

  const handleSaveEditedComic = (editedImageUrl: string) => {
    toast({
      title: "Comic saved! 💾",
      description: "Your edited comic has been saved.",
    });
    setShowEditor(false);
  };

  return (
    <div className="space-y-8">
      {/* Story Selection */}
      <div>
        <label className="block text-xl font-bold text-gray-700 mb-4">Choose Your Story 📖</label>
        <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
          <SelectTrigger className="w-full p-4 comic-border rounded-lg text-lg comic-input-focus transition-all">
            <SelectValue placeholder="Select a story to turn into a comic..." />
          </SelectTrigger>
          <SelectContent>
            {stories.length === 0 ? (
              <SelectItem value="no-stories" disabled>
                Create some stories first!
              </SelectItem>
            ) : (
              stories.map((story) => (
                <SelectItem key={story.id} value={story.id.toString()}>
                  {story.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Story Preview */}
      {selectedStory && (
        <div className="story-preview bg-gradient-to-r from-comic-yellow to-comic-peach p-6 rounded-lg comic-border">
          <h3 className="font-bold text-xl mb-3">{selectedStory.title}</h3>
          <p className="text-gray-700 mb-4">{selectedStory.description}</p>
          <div className="flex items-center space-x-3">
            <span className="font-semibold">Characters:</span>
            <div className="flex space-x-2">
              {storyCharacters.map((character) => (
                <span key={character.id} className="bg-white px-3 py-1 rounded-full text-sm font-semibold border-2 border-gray-800 shadow-sm">
                  {getRoleEmoji(character.role)} {character.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!generatedComic && (
        <div className="text-center">
          <Button
            onClick={handleGenerateComic}
            disabled={generateComicMutation.isPending || !selectedStoryId}
            className="bg-comic-purple text-white px-8 py-4 rounded-xl font-bold text-2xl comic-border hover:bg-comic-purple/80 transition-all duration-200 transform hover:scale-105 animate-bounce-slow disabled:opacity-50 disabled:animate-none disabled:transform-none"
          >
            {generateComicMutation.isPending ? "Creating Magic..." : "✨ Generate Comic Magic! ✨"}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {generateComicMutation.isPending && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-wiggle text-6xl mb-4">🎨</div>
            <h3 className="font-comic text-2xl text-comic-purple mb-2">Creating Your Comic...</h3>
            <p className="text-gray-600">Our AI artists are working their magic! ✨</p>
            <div className="flex justify-center mt-4 space-x-1">
              <div className="w-3 h-3 bg-comic-purple rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-comic-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-comic-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Comic Display */}
      {generatedComic && (
        <div className="text-center">
          <div className="bg-gradient-to-br from-comic-blue to-comic-purple p-6 rounded-xl comic-border">
            <h3 className="font-comic text-2xl text-white mb-4">🎉 Your Comic is Ready!</h3>
            
            <div className="bg-white p-4 rounded-lg comic-border mb-6">
              <img
                src={generatedComic.imageUrl}
                alt="Generated comic"
                className="w-full h-auto rounded-lg shadow-lg max-w-md mx-auto"
                onError={(e) => {
                  console.error("Failed to load generated comic image");
                  toast({
                    title: "Image load error",
                    description: "Could not display the generated comic image.",
                    variant: "destructive",
                  });
                }}
              />
            </div>
              <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={handleDownload}
                className="bg-comic-green text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-comic-green/80 transition-colors flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>💾 Download Comic</span>
              </Button>
              
              <Button
                onClick={handleEditComic}
                className="bg-comic-purple text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-comic-purple/80 transition-colors flex items-center space-x-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>✏️ Edit Comic</span>
              </Button>
              
              <Button
                onClick={handleShare}
                className="bg-comic-orange text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-comic-orange/80 transition-colors flex items-center space-x-2"
              >
                <Share2 className="w-5 h-5" />
                <span>🚀 Share Comic</span>
              </Button>
              
              <Button
                onClick={handleTryAgain}
                className="bg-comic-red text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-comic-red/80 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>🎲 Try Again</span>
              </Button>
            </div>
          </div>
        </div>      )}      {/* Comic Editor */}
      {showEditor && generatedComic && (
        <div className="mt-8">
          <ComicEditor
            imageUrl={generatedComic.imageUrl}
            comicId={generatedComic.id}
            onSave={handleSaveEditedComic}
            onClose={() => setShowEditor(false)}
          />
        </div>
      )}

      {/* Empty State */}
      {stories.length === 0 && (
        <div className="text-center mt-6">
          <div className="comic-bubble inline-block">
            <p className="text-sm font-semibold">Create some stories first to generate comics! 📚✨</p>
          </div>
        </div>
      )}
    </div>
  );
}
