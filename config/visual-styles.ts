export type VisualStyle = {
  name: string;
  description: string | object;
};

export const visualStyles: Record<string, VisualStyle> = {
  pixar: {
    name: 'Pixar',
    description: {
      style: {
        overallLook: 'Cartoony Pixar-style digital dry brush painted illustration',
        colorPalette: 'Bright, realistic colors with warm ambient lighting',
        renderQuality: 'High-resolution 2D rendering with soft shadows and subtle highlights, a painted / drawn quality',
        aestheticInfluence: 'Pixar animation with a clean, cheerful, and polished design with a hint of painted / drawn / textured quality to it',
        environmentDetail:
          'Office setting with soft wooden textures, smooth surfaces, and natural sunlight streaming through a window',
        composition: 'Character-focused portrait in 9:16 vertical format, centered with balanced props and clean layout',
      },
    },
  },
  'painted-animation': {
    name: 'Painted Animation',
    description: {
      style: {
        render: 'stylized 3-D animation',
        inspiration: 'modern feature-film (Pixar/DreamWorks) look',
        camera_angle: 'slightly low, upward view',
        depth_of_field: 'moderate background blur for clear subject focus',
      },
      lighting: {
        scheme: 'cinematic three-point',
        key_light: {
          origin: 'upper-left front',
          temperature: 'warm sunset',
          hex: '#ffcf9a',
          intensity: 'medium-high',
        },
        fill_light: {
          origin: 'lower-right',
          temperature: 'cool violet',
          hex: '#5d6aa0',
          intensity: 'low',
        },
        rim_light: {
          origin: 'rear-right',
          temperature: 'neutral',
          hex: '#d9dfe8',
          intensity: 'subtle',
        },
        atmosphere: 'slight volumetric haze softening edges',
      },
      textures: {
        primary_surface: 'smoothly shaded with gentle specular highlights',
        stone: 'rough, weathered granite showing micro-pitting',
        background: 'painterly forest bokeh with smooth colour transitions',
      },
      colours: {
        dominant: ['#db831c', '#455877', '#262831'],
        secondary: ['#bea788', '#72564b'],
        accents: ['#ffffff', '#ffe66d', '#71b0ff'],
        background_gradient: ['#4d5e89', '#35476a', '#20304d'],
      },
      shadows: {
        type: 'soft',
        direction: 'cast down-right',
        edge_softness: 'medium',
        tint: '#304262',
      },
      strokes: {
        outline: 'barely visible, darker tone of local colour',
        highlight_edge: '#c68c3a',
        shadow_edge: '#262831',
      },
      mood: 'playful adventure with a hint of curiosity',
    },
  },
  'hyper-realism': {
    name: 'Hyper Realism',
    description: {
      capture: {
        camera: {
          sensor: 'full-frame DSLR',
          lens: '35 mm prime',
          aperture: 'ƒ/1.8',
          iso: 200,
          shutter: '1/250 s',
        },
        framing: {
          orientation: 'vertical 9 × 16',
          crop: 'tight torso-up',
          composition: 'rule-of-thirds, eye-line on upper third',
        },
        depth_of_field:
          'shallow—subject tack-sharp, background smoothly defocused (bokeh)',
      },
      lighting: {
        key_light: {
          type: 'hard sunlight or stage spot',
          angle: '≈30° off camera left',
          temperature: 'warm (≈5100 K)',
          intensity: 'high, crisp highlights',
        },
        fill_light: {
          type: 'ambient room bounce',
          temperature: 'neutral',
          intensity: 'low, gentle shadow lift',
        },
        rim_light: {
          presence: 'subtle edge glow on hair and shoulders',
          temperature: 'slightly cool',
        },
        contrast:
          'high—strong separation between lit subject and darker background',
      },
      colour_grade: {
        dominant_palette: ['#f4c44e', '#1e1e1e', '#3d5a80'],
        accent_palette: ['#ffe8c3', '#86c1ff'],
        saturation: 'vivid yet natural',
        dynamic_range: 'wide—retains highlight detail and deep shadows',
      },
      texture_and_detail: {
        surface_render:
          'hyper-real, micro-details retained (skin pores, fabric weave)',
        noise: 'minimal—clean image with slight filmic grain only in shadows',
        sharpening: 'edge-aware, no halos',
      },
      overall_aesthetic: {
        look: 'editorial-quality lifestyle / tech-talk photo',
        mood: 'energetic and professional',
        authenticity:
          'appears shot in real-world conditions rather than CGI',
      },
    },
  },
}; 