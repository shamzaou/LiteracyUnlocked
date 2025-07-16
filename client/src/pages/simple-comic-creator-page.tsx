import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SimpleComicCreator from "@/components/simple-comic-creator";

export default function ComicCreator() {
  const [helpVisible, setHelpVisible] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white comic-border mx-4 mt-4 rounded-xl">
        <div className="p-6 text-center">
          <h1 className="font-comic text-4xl md:text-6xl text-comic-red mb-2">
            🎨 Create your Own Comics! 🚀
          </h1>
          <p className="text-lg text-gray-700 font-semibold">Create amazing characters, stories, and comics!</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-4 mt-6">
        <SimpleComicCreator />
      </div>

      {/* Help Section */}
      <div className="mx-4 mt-8 mb-8">
        <Card className="bg-gradient-to-r from-comic-yellow to-comic-orange comic-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="font-comic text-2xl text-gray-800">
                💡 Need Help?
              </h3>
              <Button
                onClick={() => setHelpVisible(!helpVisible)}
                className="bg-comic-purple text-white hover:bg-comic-purple/80 comic-border font-bold"
              >
                {helpVisible ? "Hide Help" : "Show Help"}
              </Button>
            </div>
            
            {helpVisible && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 p-4 rounded-lg comic-border">
                  <h4 className="font-bold text-lg mb-2">📖 1. Create Your Story</h4>
                  <p className="text-sm">Write a title and describe what happens in your story. Be creative!</p>
                </div>
                <div className="bg-white/80 p-4 rounded-lg comic-border">
                  <h4 className="font-bold text-lg mb-2">🌟 2. Add Characters</h4>
                  <p className="text-sm">Create characters by describing what they look like and their personality.</p>
                </div>
                <div className="bg-white/80 p-4 rounded-lg comic-border">
                  <h4 className="font-bold text-lg mb-2">🎨 3. Generate & Edit</h4>
                  <p className="text-sm">Generate your comic, add text bubbles, and email it to yourself!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
