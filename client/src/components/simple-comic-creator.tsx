import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { comicsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit3, RotateCcw } from "lucide-react";
import ComicEditorWithEmail from "./comic-editor-with-email";

interface Character {
  name: string;
  appearance: string;
  personality: string;
  role: string;
}

export default function SimpleComicCreator() {
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState<Character>({
    name: "",
    appearance: "",
    personality: "",
    role: "hero"
  });
  const [generatedComic, setGeneratedComic] = useState<{ imageUrl: string; prompt: string } | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();

  const generateComicMutation = useMutation({
    mutationFn: (data: { storyTitle: string; storyDescription: string; characters: Character[] }) => 
      comicsApi.generate(data),
    onSuccess: (result) => {
      setGeneratedComic({ imageUrl: result.imageUrl, prompt: result.prompt });
      toast({
        title: "Comic generated! 🎉",
        description: "Your amazing comic is ready to view and edit!",
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

  const addCharacter = () => {
    if (!newCharacter.name.trim()) {
      toast({
        title: "Character name required",
        description: "Please enter a name for your character!",
        variant: "destructive",
      });
      return;
    }

    if (!newCharacter.appearance.trim()) {
      toast({
        title: "Character appearance required", 
        description: "Please describe what your character looks like!",
        variant: "destructive",
      });
      return;
    }

    setCharacters([...characters, { ...newCharacter }]);
    setNewCharacter({
      name: "",
      appearance: "",
      personality: "",
      role: "hero"
    });

    toast({
      title: "Character added! ⭐",
      description: `${newCharacter.name} has joined your story!`,
    });
  };

  const removeCharacter = (index: number) => {
    const removedCharacter = characters[index];
    setCharacters(characters.filter((_, i) => i !== index));
    toast({
      title: "Character removed",
      description: `${removedCharacter.name} has been removed from the story.`,
    });
  };

  const handleGenerateComic = () => {
    if (!storyTitle.trim()) {
      toast({
        title: "Story title required",
        description: "Please enter a title for your story!",
        variant: "destructive",
      });
      return;
    }

    if (!storyDescription.trim()) {
      toast({
        title: "Story description required",
        description: "Please describe your story!",
        variant: "destructive",
      });
      return;
    }

    if (characters.length === 0) {
      toast({
        title: "At least one character required",
        description: "Please add at least one character to your story!",
        variant: "destructive",
      });
      return;
    }

    // Note: This will generate the comic but won't email it yet
    // The email happens in the editor after editing
    generateComicMutation.mutate({
      storyTitle,
      storyDescription,
      characters
    });
  };

  const handleEditComic = () => {
    setShowEditor(true);
  };

  const handleTryAgain = () => {
    setGeneratedComic(null);
    setShowEditor(false);
  };

  const handleSaveEditedComic = () => {
    setShowEditor(false);
    toast({
      title: "Comic creation complete! 🎉",
      description: "Your comic has been created and emailed successfully!",
    });
  };

  const handleStartOver = () => {
    setStoryTitle("");
    setStoryDescription("");
    setCharacters([]);
    setGeneratedComic(null);
    setShowEditor(false);
    setNewCharacter({
      name: "",
      appearance: "",
      personality: "",
      role: "hero"
    });
  };

  if (showEditor && generatedComic) {
    return (
      <div className="max-w-6xl mx-auto">
        <ComicEditorWithEmail
          imageUrl={generatedComic.imageUrl}
          comicId={1} // Not used in simplified version
          storyTitle={storyTitle}
          storyDescription={storyDescription}
          characters={characters}
          onSave={handleSaveEditedComic}
          onClose={() => setShowEditor(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="text-center">
        <h1 className="font-comic text-4xl text-comic-purple mb-4">
          🎨 Create Your Comic! ✨
        </h1>
        <p className="text-xl text-gray-700">
          Tell us about your story and characters, and we'll create an amazing comic for you!
        </p>
      </div>

      {!generatedComic && (
        <>
          {/* Story Section */}
          <Card className="comic-border bg-gradient-to-br from-comic-yellow to-comic-peach">
            <CardHeader>
              <CardTitle className="font-comic text-2xl text-gray-800 flex items-center">
                📖 Your Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-lg font-bold">Story Title *</Label>
                <Input
                  id="title"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Enter your story title..."
                  className="comic-border comic-input-focus text-lg"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-lg font-bold">Story Description *</Label>
                <Textarea
                  id="description"
                  value={storyDescription}
                  onChange={(e) => setStoryDescription(e.target.value)}
                  placeholder="Describe what happens in your story..."
                  className="comic-border comic-input-focus text-lg min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Characters Section */}
          <Card className="comic-border bg-gradient-to-br from-comic-blue to-comic-purple text-white">
            <CardHeader>
              <CardTitle className="font-comic text-2xl flex items-center">
                🌟 Your Characters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Character */}
              <div className="bg-white/10 p-4 rounded-lg space-y-4">
                <h3 className="font-bold text-lg">Add a New Character:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Character Name *</Label>
                    <Input
                      value={newCharacter.name}
                      onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                      placeholder="Character name..."
                      className="bg-white text-gray-800 comic-border"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Role</Label>
                    <Select value={newCharacter.role} onValueChange={(value) => setNewCharacter({...newCharacter, role: value})}>
                      <SelectTrigger className="bg-white text-gray-800 comic-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">🦸 Hero</SelectItem>
                        <SelectItem value="villain">😈 Villain</SelectItem>
                        <SelectItem value="friend">👫 Friend</SelectItem>
                        <SelectItem value="helper">🤝 Helper</SelectItem>
                        <SelectItem value="pet">🐕 Pet</SelectItem>
                        <SelectItem value="other">🌟 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Appearance *</Label>
                    <Input
                      value={newCharacter.appearance}
                      onChange={(e) => setNewCharacter({...newCharacter, appearance: e.target.value})}
                      placeholder="What do they look like?"
                      className="bg-white text-gray-800 comic-border"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Personality</Label>
                    <Input
                      value={newCharacter.personality}
                      onChange={(e) => setNewCharacter({...newCharacter, personality: e.target.value})}
                      placeholder="How do they act?"
                      className="bg-white text-gray-800 comic-border"
                    />
                  </div>
                </div>
                <Button
                  onClick={addCharacter}
                  className="bg-comic-green text-white hover:bg-comic-green/80 comic-border font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Character
                </Button>
              </div>

              {/* Character List */}
              {characters.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg">Your Characters:</h3>
                  {characters.map((character, index) => (
                    <div key={index} className="bg-white/20 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getRoleEmoji(character.role)}</span>
                          <span className="font-bold text-lg">{character.name}</span>
                          <span className="text-sm bg-white/20 px-2 py-1 rounded">{character.role}</span>
                        </div>
                        <p className="text-sm opacity-90"><strong>Looks:</strong> {character.appearance}</p>
                        {character.personality && (
                          <p className="text-sm opacity-90"><strong>Personality:</strong> {character.personality}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => removeCharacter(index)}
                        variant="outline"
                        size="sm"
                        className="ml-4 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="text-center">
            <Button
              onClick={handleGenerateComic}
              disabled={generateComicMutation.isPending}
              className="bg-comic-purple text-white px-8 py-4 rounded-xl font-bold text-2xl comic-border hover:bg-comic-purple/80 transition-all duration-200 transform hover:scale-105 animate-bounce-slow disabled:opacity-50 disabled:animate-none disabled:transform-none"
            >
              {generateComicMutation.isPending ? "Creating Magic..." : "✨ Generate Comic Magic! ✨"}
            </Button>
          </div>

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
        </>
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
                onClick={handleEditComic}
                className="bg-comic-purple text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-comic-purple/80 transition-colors flex items-center space-x-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>✏️ Edit & Email Comic</span>
              </Button>
              
              <Button
                onClick={handleTryAgain}
                className="bg-comic-red text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-comic-red/80 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>🎲 Try Again</span>
              </Button>

              <Button
                onClick={handleStartOver}
                className="bg-comic-orange text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-comic-orange/80 transition-colors"
              >
                🆕 Start Over
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
