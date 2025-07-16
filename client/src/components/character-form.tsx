import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertCharacterSchema, type InsertCharacter } from "@shared/schema";
import { charactersApi, localStorageApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CharacterFormProps {
  onSuccess?: () => void;
}

export default function CharacterForm({ onSuccess }: CharacterFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCharacter>({
    resolver: zodResolver(insertCharacterSchema),
    defaultValues: {
      name: "",
      appearance: "",
      personality: "",
      role: "",
    },
  });

  const createCharacterMutation = useMutation({
    mutationFn: charactersApi.create,
    onSuccess: (newCharacter) => {
      // Invalidate and refetch characters
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      
      // Update local storage
      const currentCharacters = queryClient.getQueryData<any[]>(["/api/characters"]) || [];
      localStorageApi.saveCharacters([...currentCharacters, newCharacter]);
      
      // Reset form
      form.reset();
      
      // Show success message
      toast({
        title: "Character created! 🎉",
        description: `${newCharacter.name} has been added to your characters.`,
      });
      
      // Call success callback
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error creating character",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCharacter) => {
    createCharacterMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-700">Character Name 📝</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter a cool name..."
                  className="w-full p-4 comic-border rounded-lg text-lg comic-input-focus transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appearance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-700">Appearance 👀</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe how they look..."
                  className="w-full p-4 comic-border rounded-lg text-lg h-24 comic-input-focus transition-all resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personality"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-700">Personality 💭</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="What are they like..."
                  className="w-full p-4 comic-border rounded-lg text-lg h-24 comic-input-focus transition-all resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-700">Story Role 🎭</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full p-4 comic-border rounded-lg text-lg comic-input-focus transition-all">
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hero">🦸 Hero</SelectItem>
                  <SelectItem value="villain">😈 Villain</SelectItem>
                  <SelectItem value="friend">👫 Friend</SelectItem>
                  <SelectItem value="helper">🤝 Helper</SelectItem>
                  <SelectItem value="pet">🐕 Pet</SelectItem>
                  <SelectItem value="other">🌟 Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createCharacterMutation.isPending}
          className="w-full bg-comic-red text-white py-4 rounded-lg font-bold text-xl comic-border hover:bg-comic-red/80 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {createCharacterMutation.isPending ? "Creating..." : "🎨 Create Character!"}
        </Button>
      </form>
    </Form>
  );
}
