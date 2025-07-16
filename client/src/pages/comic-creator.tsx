import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { charactersApi, storiesApi } from "@/lib/api";
import CharacterForm from "@/components/character-form";
import StoryForm from "@/components/story-form";
import ComicGenerator from "@/components/comic-generator";

export default function ComicCreator() {
  const [helpVisible, setHelpVisible] = useState(false);

  const { data: characters = [], refetch: refetchCharacters } = useQuery({
    queryKey: ["/api/characters"],
    queryFn: () => charactersApi.getAll(),
  });

  const { data: stories = [], refetch: refetchStories } = useQuery({
    queryKey: ["/api/stories"],
    queryFn: () => storiesApi.getAll(),
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white comic-border mx-4 mt-4 rounded-xl">
        <div className="p-6 text-center">
          <h1 className="font-comic text-4xl md:text-6xl text-comic-red mb-2">
            🎨 Create your Own Comics! 🚀
          </h1>
          <p className="text-lg text-gray-700 font-semibold">Create amazing characters and stories!</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-4 mt-6">
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-3 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="characters" 
              className="bg-comic-blue text-white px-6 py-3 rounded-full font-bold text-lg comic-border hover:bg-comic-blue/80 data-[state=active]:bg-comic-blue data-[state=active]:text-white transition-all duration-200 transform hover:scale-105"
            >
              👤 My Characters
            </TabsTrigger>
            <TabsTrigger 
              value="stories" 
              className="bg-comic-green text-white px-6 py-3 rounded-full font-bold text-lg comic-border hover:bg-comic-green/80 data-[state=active]:bg-comic-green data-[state=active]:text-white transition-all duration-200 transform hover:scale-105"
            >
              📚 My Stories
            </TabsTrigger>
            <TabsTrigger 
              value="comics" 
              className="bg-comic-purple text-white px-6 py-3 rounded-full font-bold text-lg comic-border hover:bg-comic-purple/80 data-[state=active]:bg-comic-purple data-[state=active]:text-white transition-all duration-200 transform hover:scale-105"
            >
              🎭 Create Comics
            </TabsTrigger>
          </TabsList>

          {/* Characters Tab */}
          <TabsContent value="characters" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Character Creation Form */}
              <Card className="bg-white rounded-xl comic-border">
                <CardContent className="p-6">
                  <h2 className="font-comic text-3xl text-comic-red mb-6 text-center">✨ Create New Character</h2>
                  <CharacterForm onSuccess={refetchCharacters} />
                </CardContent>
              </Card>

              {/* Characters Gallery */}
              <Card className="bg-white rounded-xl comic-border">
                <CardContent className="p-6">
                  <h2 className="font-comic text-3xl text-comic-teal mb-6 text-center">👥 My Characters</h2>
                  
                  <div className="space-y-4">
                    {characters.length === 0 ? (
                      <div className="text-center mt-6">
                        <div className="comic-bubble inline-block">
                          <p className="text-sm font-semibold">Create your first character to get started! 🌟</p>
                        </div>
                      </div>
                    ) : (
                      characters.map((character) => (
                        <div key={character.id} className="character-card bg-gradient-to-r from-comic-yellow to-comic-orange p-4 rounded-lg comic-border">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-comic-blue rounded-full flex items-center justify-center text-2xl">
                              {getRoleEmoji(character.role)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{character.name}</h3>
                              <p className="text-sm text-gray-700">{getRoleEmoji(character.role)} {character.role}</p>
                              <p className="text-xs text-gray-600 mt-1">{character.appearance}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Story Creation Form */}
              <Card className="bg-white rounded-xl comic-border">
                <CardContent className="p-6">
                  <h2 className="font-comic text-3xl text-comic-green mb-6 text-center">📝 Create New Story</h2>
                  <StoryForm characters={characters} onSuccess={refetchStories} />
                </CardContent>
              </Card>

              {/* Stories Gallery */}
              <Card className="bg-white rounded-xl comic-border">
                <CardContent className="p-6">
                  <h2 className="font-comic text-3xl text-comic-purple mb-6 text-center">📚 My Stories</h2>
                  
                  <div className="space-y-4">
                    {stories.length === 0 ? (
                      <div className="text-center mt-6">
                        <div className="comic-bubble inline-block">
                          <p className="text-sm font-semibold">Write amazing stories with your characters! ✨</p>
                        </div>
                      </div>
                    ) : (
                      stories.map((story) => {
                        const storyCharacters = characters.filter(char => 
                          story.characterIds.includes(char.id)
                        );
                        
                        return (
                          <div key={story.id} className="story-card bg-gradient-to-r from-comic-blue to-comic-teal p-5 rounded-lg comic-border">
                            <h3 className="font-bold text-xl text-white mb-2">{story.title}</h3>
                            <p className="text-white text-sm mb-3 opacity-90">{story.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                {storyCharacters.map((character) => (
                                  <div key={character.id} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">
                                    {getRoleEmoji(character.role)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comics Tab */}
          <TabsContent value="comics" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white rounded-xl comic-border">
                <CardContent className="p-6">
                  <h2 className="font-comic text-4xl text-comic-purple mb-8 text-center">🎭 Generate Amazing Comics!</h2>
                  <ComicGenerator stories={stories} characters={characters} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Help Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setHelpVisible(!helpVisible)}
          className="bg-comic-yellow text-gray-800 w-16 h-16 rounded-full comic-border hover:bg-comic-yellow/80 transition-all duration-200 transform hover:scale-110 text-2xl animate-bounce-slow"
        >
          💡
        </Button>
        
        {helpVisible && (
          <div className="absolute bottom-20 right-0 w-80 bg-white comic-border rounded-xl p-4">
            <h4 className="font-bold text-lg mb-2">🌟 Need Help?</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Create characters with names and descriptions</li>
              <li>• Write exciting stories using your characters</li>
              <li>• Generate comics with AI magic!</li>
              <li>• Download and share your creations</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
