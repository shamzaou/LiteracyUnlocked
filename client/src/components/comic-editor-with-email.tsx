import React, { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, FabricText, Group } from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Type, MessageSquare, Download, Trash2, X, Mail } from 'lucide-react';
import EmailComicForm from "./email-comic-form";

interface ComicEditorProps {
  imageUrl: string;
  comicId: number;
  storyTitle: string;
  storyDescription: string;
  characters: Array<{
    name: string;
    appearance: string;
    personality: string;
    role: string;
  }>;
  onSave?: (editedImageUrl: string) => void;
  onClose?: () => void;
}

export default function ComicEditorWithEmail({ 
  imageUrl, 
  comicId, 
  storyTitle, 
  storyDescription, 
  characters, 
  onSave, 
  onClose 
}: ComicEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const clickHandlerRef = useRef<((x: number, y: number) => void) | null>(null);
  const [selectedTool, setSelectedTool] = useState<'text' | 'dialogue' | null>(null);
  const [bubbleType, setBubbleType] = useState<'speech' | 'thought' | 'shout'>('speech');
  const [textValue, setTextValue] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [strokeColor, setStrokeColor] = useState('#FFFFFF');
  const [addStroke, setAddStroke] = useState(false);
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string>('');
  const { toast } = useToast();

  const colorPresets = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', 
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FF8C00', '#8A2BE2', '#32CD32', '#FF1493'
  ];

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: 'white',
      });

      FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img: any) => {
        const canvasWidth = fabricCanvas.width!;
        const canvasHeight = fabricCanvas.height!;
        const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!);
        
        img.scale(scale);
        img.set({
          left: (canvasWidth - img.width! * scale) / 2,
          top: (canvasHeight - img.height! * scale) / 2,
          selectable: false,
          evented: false,
        });
        
        fabricCanvas.backgroundImage = img;
        fabricCanvas.renderAll();
      }).catch((error: any) => {
        console.error('Failed to load image:', error);
        toast({
          title: 'Image load error',
          description: 'Could not load the comic image for editing.',
          variant: 'destructive',
        });
      });

      fabricCanvas.on('mouse:down', (options: any) => {
        const pointer = fabricCanvas.getPointer(options.e);
        if (clickHandlerRef.current) {
          clickHandlerRef.current(pointer.x, pointer.y);
        }
      });

      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteSelectedElement();
        }
      };

      document.addEventListener('keydown', handleKeyPress);
      setCanvas(fabricCanvas);

      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        fabricCanvas.dispose();
      };
    }
  }, [imageUrl]);

  useEffect(() => {
    clickHandlerRef.current = (x: number, y: number) => {
      if (selectedTool && textValue.trim()) {
        addElement(x, y);
      }
    };
  }, [selectedTool, textValue, canvas, bubbleType, fontSize, textColor, fontFamily, fontWeight, fontStyle, addStroke, strokeColor]);

  const addElement = (x: number, y: number) => {
    if (!canvas || !textValue.trim()) {
      return;
    }

    if (selectedTool === 'text') {
      const textOptions: any = {
        left: x,
        top: y,
        fontSize: fontSize,
        fill: textColor,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
      };

      if (addStroke) {
        textOptions.stroke = strokeColor;
        textOptions.strokeWidth = 1;
      }

      const text = new FabricText(textValue, textOptions);
      canvas.add(text);
      canvas.renderAll();
      setTextValue('');
      setSelectedTool(null);

      toast({
        title: 'Text added!',
        description: 'Click and drag to reposition.',
      });
    } else if (selectedTool === 'dialogue') {
      const bubbleImages = {
        speech: 'data:image/svg+xml;base64,' + btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="50" rx="90" ry="40" fill="white" stroke="#333" stroke-width="3"/>
  <path d="M 70 85 L 60 110 L 90 90 Z" fill="white" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
</svg>`),
        thought: 'data:image/svg+xml;base64,' + btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="100" viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="90" cy="40" rx="80" ry="30" fill="white" stroke="#333" stroke-width="3"/>
  <circle cx="45" cy="75" r="8" fill="white" stroke="#333" stroke-width="2"/>
  <circle cx="30" cy="85" r="5" fill="white" stroke="#333" stroke-width="2"/>
  <circle cx="20" cy="92" r="3" fill="white" stroke="#333" stroke-width="2"/>
</svg>`),
        shout: 'data:image/svg+xml;base64,' + btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M 20 20 L 30 10 L 50 15 L 60 5 L 80 10 L 90 2 L 110 8 L 130 3 L 150 10 L 170 5 L 180 15 L 185 25 L 180 35 L 175 45 L 170 55 L 160 60 L 150 65 L 140 70 L 120 68 L 100 70 L 80 68 L 60 70 L 50 65 L 40 60 L 30 55 L 25 45 L 20 35 L 15 25 Z" fill="white" stroke="#333" stroke-width="3"/>
  <path d="M 60 65 L 50 85 L 45 75 L 40 90 L 35 80 L 80 70 Z" fill="white" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
</svg>`)
      };

      const textLength = textValue.length;
      const baseScale = Math.min(2.0, Math.max(0.6, textLength / 40 + 0.7));
      
      FabricImage.fromURL(bubbleImages[bubbleType], { crossOrigin: 'anonymous' }).then((bubbleImg: any) => {
        bubbleImg.scale(baseScale);
        
        let textWidth = (bubbleImg.width! * baseScale) - 60;
        let maxFontSize = fontSize;
        
        if (bubbleType === 'thought') {
          textWidth = textWidth * 0.8;
          maxFontSize = Math.min(fontSize, 18);
        } else if (bubbleType === 'shout') {
          textWidth = textWidth * 0.7;
          maxFontSize = Math.min(fontSize, 22);
        }
        
        const text = new FabricText(textValue, {
          fontSize: maxFontSize,
          fill: textColor,
          fontFamily: fontFamily,
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          width: Math.max(textWidth, 80),
          splitByGrapheme: true,
          ...(addStroke && {
            stroke: strokeColor,
            strokeWidth: 1,
          }),
        });

        bubbleImg.set({
          originX: 'center',
          originY: 'center',
        });

        let textOffsetX = 0;
        let textOffsetY = 0;
        
        if (bubbleType === 'thought') {
          textOffsetY = -15;
        } else if (bubbleType === 'shout') {
          textOffsetY = -5;
        } else {
          textOffsetY = -8;
        }

        text.set({
          left: textOffsetX,
          top: textOffsetY,
        });

        const group = new Group([bubbleImg, text], {
          left: x,
          top: y,
          originX: 'center',
          originY: 'center',
          selectable: true,
        });

        canvas.add(group);
        canvas.renderAll();
        
        toast({
          title: `${bubbleType.charAt(0).toUpperCase() + bubbleType.slice(1)} bubble added!`,
          description: 'Click and drag to reposition.',
        });
      }).catch((error: any) => {
        console.error('Failed to load bubble image:', error);
        toast({
          title: 'Bubble load error',
          description: 'Could not load the bubble image. Please try again.',
          variant: 'destructive',
        });
      });
      
      setTextValue('');
      setSelectedTool(null);
      return;
    }
  };

  const deleteSelectedElement = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      toast({
        title: 'Element deleted!',
        description: 'Selected element has been removed.',
      });
    }
  };

  const downloadEditedComic = async () => {
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });

      const link = document.createElement('a');
      link.download = `edited-comic-${comicId}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onSave) {
        onSave(dataURL);
      }

      toast({
        title: 'Comic saved! 💾',
        description: 'Your edited comic has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Could not save the edited comic.',
        variant: 'destructive',
      });
    }
  };

  const handleEmailComic = async () => {
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });

      setEditedImageUrl(dataURL);
      setShowEmailForm(true);

      toast({
        title: 'Comic ready to email! 📧',
        description: 'Enter your details to receive your comic via email.',
      });
    } catch (error) {
      toast({
        title: 'Preparation failed',
        description: 'Could not prepare the comic for emailing.',
        variant: 'destructive',
      });
    }
  };

  const handleEmailSuccess = () => {
    setShowEmailForm(false);
    if (onSave && editedImageUrl) {
      onSave(editedImageUrl);
    }
  };

  const handleEmailBack = () => {
    setShowEmailForm(false);
  };

  if (showEmailForm) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <EmailComicForm
          imageUrl={editedImageUrl}
          storyTitle={storyTitle}
          storyDescription={storyDescription}
          characters={characters}
          onBack={handleEmailBack}
          onSuccess={handleEmailSuccess}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      <div className="flex-1">
        <Card className="comic-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-comic text-2xl text-comic-purple">
                🎨 Comic Editor
              </h3>
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="comic-border hover:bg-comic-red hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Close
                </Button>
              )}
            </div>

            <div className="border-4 border-gray-800 rounded-lg overflow-hidden bg-gray-100">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                💡 <strong>Controls:</strong> Click elements to select • Delete key to remove
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-80">
        <Card className="comic-border bg-gradient-to-br from-comic-yellow to-comic-orange">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-comic text-xl text-gray-800 mb-4 text-center">
              🛠️ Editing Tools
            </h3>

            <div className="space-y-3">
              <Label className="text-lg font-bold">Select Tool:</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setSelectedTool('text')}
                  variant={selectedTool === 'text' ? 'default' : 'outline'}
                  className={`h-12 ${
                    selectedTool === 'text'
                      ? 'bg-comic-blue text-white'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  } comic-border font-bold`}
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </Button>
                <Button
                  onClick={() => setSelectedTool('dialogue')}
                  variant={selectedTool === 'dialogue' ? 'default' : 'outline'}
                  className={`h-12 ${
                    selectedTool === 'dialogue'
                      ? 'bg-comic-green text-white'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  } comic-border font-bold`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Dialogue
                </Button>
              </div>
            </div>

            {selectedTool && (
              <div className="space-y-3">
                <Label className="text-lg font-bold">Text Content:</Label>
                <Input
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={
                    selectedTool === 'text' ? 'Enter text...' : 'Enter dialogue...'
                  }
                  className="comic-border comic-input-focus"
                />
              </div>
            )}

            {selectedTool === 'dialogue' && (
              <div className="space-y-3">
                <Label className="text-lg font-bold">Bubble Type:</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setBubbleType('speech')}
                    variant={bubbleType === 'speech' ? 'default' : 'outline'}
                    className={`h-10 text-sm ${
                      bubbleType === 'speech'
                        ? 'bg-comic-blue text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    } comic-border font-bold`}
                  >
                    💬 Speech
                  </Button>
                  <Button
                    onClick={() => setBubbleType('thought')}
                    variant={bubbleType === 'thought' ? 'default' : 'outline'}
                    className={`h-10 text-sm ${
                      bubbleType === 'thought'
                        ? 'bg-comic-purple text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    } comic-border font-bold`}
                  >
                    💭 Thought
                  </Button>
                  <Button
                    onClick={() => setBubbleType('shout')}
                    variant={bubbleType === 'shout' ? 'default' : 'outline'}
                    className={`h-10 text-sm ${
                      bubbleType === 'shout'
                        ? 'bg-comic-red text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    } comic-border font-bold`}
                  >
                    📢 Shout
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-lg font-bold">Text Style:</Label>
              
              <div>
                <Label className="text-sm">Font</Label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2 border-2 border-gray-800 rounded-lg comic-border"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times">Times</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Size</Label>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    min="10"
                    max="72"
                    className="comic-border"
                  />
                </div>
                <div>
                  <Label className="text-sm">Color</Label>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="comic-border h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="addStroke"
                    checked={addStroke}
                    onChange={(e) => setAddStroke(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="addStroke" className="text-sm">Add text outline</Label>
                </div>
                
                {addStroke && (
                  <div>
                    <Label className="text-sm">Outline Color</Label>
                    <Input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="comic-border h-10"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm mb-2 block">Quick Colors:</Label>
                <div className="grid grid-cols-6 gap-1">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className="w-8 h-8 rounded border-2 border-gray-800 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {selectedTool && (
              <div className="bg-white/80 p-3 rounded-lg comic-border">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  💡 Click on the comic to add {selectedTool === 'text' ? 'text' : 'dialogue bubble'}!
                </p>
                {selectedTool === 'dialogue' && (
                  <div className="mt-2 p-2 bg-gray-100 rounded border">
                    <p className="text-xs text-gray-600">
                      Different bubble types: 💬 Speech (normal talking), 💭 Thought (thinking), 📢 Shout (loud/excited)
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={deleteSelectedElement}
                className="w-full bg-comic-red text-white hover:bg-comic-red/80 comic-border font-bold"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
              
              <Button
                onClick={downloadEditedComic}
                className="w-full bg-comic-green text-white hover:bg-comic-green/80 comic-border font-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                💾 Download Comic
              </Button>

              <Button
                onClick={handleEmailComic}
                className="w-full bg-comic-purple text-white hover:bg-comic-purple/80 comic-border font-bold text-lg py-3"
              >
                <Mail className="w-5 h-5 mr-2" />
                📧 Email My Comic!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
