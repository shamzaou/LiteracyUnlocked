import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertStorySchema, type InsertStory, type Character } from "@shared/schema";
import { storiesApi, localStorageApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface StoryFormProps {
  characters: Character[];
  onSuccess?: () => void;
}

export default function StoryForm({ characters, onSuccess }: StoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertStory>({
    resolver: zodResolver(insertStorySchema),
    defaultValues: {
      title: "",
      description: "",
      characterIds: [],
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: storiesApi.create,
    onSuccess: (newStory) => {
      // Invalidate and refetch stories
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      
      // Update local storage
      const currentStories = queryClient.getQueryData<any[]>(["/api/stories"]) || [];
      localStorageApi.saveStories([...currentStories, newStory]);
      
      // Reset form
      form.reset();
      
      // Show success message
      toast({
        title: "Story created! 📚",
        description: `"${newStory.title}" has been added to your stories.`,
      });
      
      // Call success callback
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error creating story",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStory) => {
    createStoryMutation.mutate(data);
  };

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-700">Story Title 📖</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Give your story a title..."
                  className="w-full p-4 comic-border rounded-lg text-lg comic-input-focus transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-700">Story Description 📝</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Tell us what happens in your story..."
                  className="w-full p-4 comic-border rounded-lg text-lg h-32 comic-input-focus transition-all resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="characterIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-700 mb-3">Choose Characters 👥</FormLabel>
              {characters.length === 0 ? (
                <div className="text-center p-4 comic-border rounded-lg">
                  <p className="text-gray-600">Create some characters first to add them to your story!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto comic-border rounded-lg p-3">
                  {characters.map((character) => (
                    <div key={character.id} className="flex items-center space-x-3 p-2 hover:bg-comic-yellow/20 rounded-lg transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(character.id) || false}
                          onCheckedChange={(checked) => {
                            const currentIds = field.value || [];
                            if (checked) {
                              field.onChange([...currentIds, character.id]);
                            } else {
                              field.onChange(currentIds.filter(id => id !== character.id));
                            }
                          }}
                          className="w-5 h-5 data-[state=checked]:bg-comic-purple rounded border-2 border-gray-800"
                        />
                      </FormControl>
                      <div className="w-8 h-8 bg-comic-blue rounded-full flex items-center justify-center text-sm">
                        {getRoleEmoji(character.role)}
                      </div>
                      <span className="font-semibold">{character.name}</span>
                      <span className="text-sm text-gray-600">({character.role})</span>
                    </div>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createStoryMutation.isPending || characters.length === 0}
          className="w-full bg-comic-green text-white py-4 rounded-lg font-bold text-xl comic-border hover:bg-comic-green/80 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {createStoryMutation.isPending ? "Creating..." : "📚 Create Story!"}
        </Button>
      </form>
    </Form>
  );
}
