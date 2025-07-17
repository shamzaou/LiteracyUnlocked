import nodemailer from "nodemailer";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ComicEmailData {
  childName: string;
  childEmail: string;
  parentEmail: string;
  storyTitle: string;
  storyDescription: string;
  characters: Array<{
    name: string;
    appearance: string;
    personality: string;
    role: string;
  }>;
  imageUrl: string;
}

// Create transporter using Gmail (you can change this to any email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // Your Gmail App Password
    },
  });
};

export async function sendComicEmail(data: ComicEmailData) {
  const transporter = createTransporter();

  // Convert relative URLs to absolute URLs for email compatibility
  let imageUrl = data.imageUrl;
  let attachmentPath: string | null = null;
  
  if (imageUrl.startsWith('/generated-images/')) {
    // Extract filename before converting to absolute URL
    const filename = imageUrl.split('/').pop();
    imageUrl = `https://literacyunlocked.ae${imageUrl}`;
    
    // Set the local file path for attachment - check persistent location first
    if (filename) {
      const publicPath = path.join(__dirname, '..', 'public', 'generated-images', filename);
      const distPath = path.join(__dirname, '..', 'dist', 'public', 'generated-images', filename);
      
      // Check persistent location first, then temporary
      if (fs.existsSync(publicPath)) {
        attachmentPath = publicPath;
        console.log(`📎 Using persistent comic image: ${publicPath}`);
      } else if (fs.existsSync(distPath)) {
        attachmentPath = distPath;
        console.log(`📎 Using temporary comic image: ${distPath}`);
      } else {
        console.warn(`⚠️ Comic image not found in either location: ${publicPath} or ${distPath}`);
        attachmentPath = null;
      }
    }
  } else if (imageUrl.startsWith('/')) {
    // For static files like example images
    const filename = imageUrl.substring(1); // Remove leading slash
    imageUrl = `https://literacyunlocked.ae${imageUrl}`;
    
    // Check both possible locations for static files
    const distPath = path.join(__dirname, '..', 'dist', 'public', filename);
    const publicPath = path.join(__dirname, '..', 'public', filename);
    
    if (fs.existsSync(publicPath)) {
      attachmentPath = publicPath;
    } else if (fs.existsSync(distPath)) {
      attachmentPath = distPath;
    } else {
      console.warn(`⚠️ Static image not found in either location: ${publicPath} or ${distPath}`);
      attachmentPath = null;
    }
  } else if (imageUrl.startsWith('data:image/')) {
    // Handle base64 encoded images by saving to file first
    console.log(`📎 Processing base64 image data for attachment`);
    try {
      const base64Data = imageUrl.split(',')[1]; // Remove the data:image/png;base64, prefix
      const imageFormat = imageUrl.match(/data:image\/([^;]+)/)?.[1] || 'png';
      const timestamp = Date.now();
      const filename = `comic-${timestamp}-${Math.random().toString(36).substr(2, 6)}.${imageFormat}`;
      const tempPath = path.join(__dirname, '..', 'public', 'generated-images', filename);
      
      // Ensure directory exists
      const dir = path.dirname(tempPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Save base64 data to file
      fs.writeFileSync(tempPath, base64Data, 'base64');
      attachmentPath = tempPath;
      console.log(`📎 Saved base64 image to: ${tempPath}`);
    } catch (error) {
      console.error('Failed to save base64 image:', error);
      attachmentPath = null;
    }
  } else {
    console.log(`⚠️ Unexpected imageUrl format: ${imageUrl}`);
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">🎨 New Comic Created! 🎨</h1>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h2 style="color: #495057;">Story Details</h2>
        <p><strong>Title:</strong> ${data.storyTitle}</p>
        <p><strong>Description:</strong> ${data.storyDescription}</p>
        <p><strong>Created by:</strong> ${data.childName}</p>
      </div>

      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #1565c0;">Characters</h3>
        ${data.characters.map(char => `
          <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 5px;">
            <h4 style="margin: 0; color: #333;">${char.name}</h4>
            <p style="margin: 5px 0;"><strong>Appearance:</strong> ${char.appearance}</p>
            <p style="margin: 5px 0;"><strong>Personality:</strong> ${char.personality}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${char.role}</p>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <h3 style="color: #333;">Generated Comic</h3>
        <img src="cid:comic-image" alt="Generated Comic" style="max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <p style="color: #6c757d; font-size: 12px; margin-top: 10px;">
          If you can't see the image above, please check your email attachments.
        </p>
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>Note:</strong> This comic was generated using AI based on the story and characters created by ${data.childName}. 
          Great creativity! 🌟
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
      
      <p style="text-align: center; color: #6c757d; font-size: 14px;">
        Generated by ChildComicCraft - Where imagination meets technology!
      </p>
    </div>
  `;

  // Prepare attachments array
  const attachments: any[] = [];
  
  // Add the comic image as an attachment if the file exists locally
  if (attachmentPath && fs.existsSync(attachmentPath)) {
    console.log(`📎 Adding comic image attachment: ${attachmentPath}`);
    attachments.push({
      filename: `${data.storyTitle.replace(/[^a-zA-Z0-9]/g, '_')}_comic.png`,
      path: attachmentPath,
      cid: 'comic-image' // This allows us to reference it in HTML with cid:comic-image
    });
  } else {
    console.warn(`⚠️ Comic image file not found for attachment: ${attachmentPath}`);
    // Fallback: try to use the external URL as attachment (less reliable)
    if (imageUrl.startsWith('https://literacyunlocked.ae/')) {
      attachments.push({
        filename: `${data.storyTitle.replace(/[^a-zA-Z0-9]/g, '_')}_comic.png`,
        path: imageUrl
      });
    }
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: data.parentEmail,
    cc: [data.childEmail, process.env.ADMIN_EMAIL].filter(Boolean).join(','),
    subject: `🎨 ${data.childName}'s New Comic: "${data.storyTitle}"`,
    html: htmlContent,
    attachments: attachments
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
