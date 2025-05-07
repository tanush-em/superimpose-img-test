// app/api/generate/route.js
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Standard size for equirectangular images
const WIDTH = 2048;
const HEIGHT = 4096;

export async function POST(request) {
  try {
    // Parse request data
    const data = await request.json();
    console.log('Received request data:', data);
    
    // Extract floor option from selectedItems
    const floorId = data.selectedItems?.floor || 'floor-1';
    const floorOption = parseInt(floorId.replace('floor-', '')) || 1;
    console.log('Using floor option:', floorOption);

    // Define the layers in order: wall, furniture, floor
    const wallPath = path.join(process.cwd(), 'public', 'Walllayer.png');
    const furniturePath = path.join(process.cwd(), 'public', 'Furniturelayer.png');
    const floorPath = path.join(process.cwd(), 'public', 
      floorOption === 2 ? 'Flooroption2.png' : 'Flooroption1.png'
    );

    // Verify files exist
    const files = [wallPath, furniturePath, floorPath];
    for (const file of files) {
      if (!fs.existsSync(file)) {
        console.error('Missing required file:', file);
        throw new Error(`Missing required file: ${path.basename(file)}`);
      }
    }

    console.log('All required files found, starting image processing');

    // Load and resize all images to the same dimensions
    console.log('Resizing images to', WIDTH, 'x', HEIGHT);
    
    // Start with the wall layer as base
    let wallImage = await sharp(wallPath)
      .resize(WIDTH, HEIGHT, {
        fit: 'fill',
        position: 'center'
      })
      .toBuffer();

    // Resize furniture layer
    const furnitureImage = await sharp(furniturePath)
      .resize(WIDTH, HEIGHT, {
        fit: 'fill',
        position: 'center'
      })
      .toBuffer();

    // Resize floor layer
    const floorImage = await sharp(floorPath)
      .resize(WIDTH, HEIGHT, {
        fit: 'fill',
        position: 'center'
      })
      .toBuffer();

    console.log('All images resized successfully');

    // Create overlay array with resized images
    const overlays = [
      { 
        input: furnitureImage,
        blend: 'over'
      },
      { 
        input: floorImage,
        blend: 'over'
      }
    ];

    console.log('Starting image composition');

    // Composite all layers together
    const finalImage = await sharp(wallImage)
      .composite(overlays)
      .png()
      .toBuffer();

    console.log('Image composition completed successfully');

    // Convert the buffer to base64
    const base64Image = finalImage.toString('base64');
    
    // Return success response with base64 image data
    return new NextResponse(JSON.stringify({
      success: true,
      imageData: `data:image/png;base64,${base64Image}`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to generate image',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
