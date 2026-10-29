export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: 'advisory' | 'helpline' | 'legal' | 'firstaid';
  suggestedAction?: {
    label: string;
    actionType: 'call' | 'navigate';
    target: string;
  };
}

interface SafetyTopic {
  keywords: string[];
  response: string;
  category: ChatMessage['category'];
  suggestedAction?: ChatMessage['suggestedAction'];
}

const SAFETY_KNOWLEDGE_BASE: SafetyTopic[] = [
  {
    keywords: ['night', 'dark', 'after 9', 'safe at night', 'late', 'evening', 'walk'],
    category: 'advisory',
    response:
      'For night travel in Delhi, stick strictly to designated Safe Zones like India Gate / Kartavya Path, Aerocity, and well-lit central avenues until 10:30 PM. Avoid unlit lanes in Old Delhi, isolated parks, or the Ridge Forest Buffer after dusk. Always prefer registered app cabs (Uber/Ola) with live trip sharing active over unverified street rickshaws.',
    suggestedAction: {
      label: 'View Safety Zones Map',
      actionType: 'navigate',
      target: '/zones'
    }
  },
  {
    keywords: ['taxi', 'cab', 'scam', 'overcharge', 'auto', 'rickshaw', 'fare', 'meter'],
    category: 'legal',
    response:
      'In Delhi, auto-rickshaws and taxis are mandated by law to run on electronic meters. If a driver refuses or quotes an exorbitant flat rate, insist on meter fare or book via official prepaid taxi booths at railway stations and airports. If harassed or threatened, take a photo of the vehicle license plate (e.g., DL-1R-xxxx) and report it to the nearest Traffic Police booth or via SURAKSHA Report Incident.',
    suggestedAction: {
      label: 'File Report',
      actionType: 'navigate',
      target: '/report'
    }
  },
  {
    keywords: ['passport', 'lost document', 'visa', 'embassy', 'consular', 'stolen wallet'],
    category: 'legal',
    response:
      'If your foreign passport or national ID is lost: 1. File a digital Lost Report immediately using SURAKSHA or the Delhi Police Citizen portal. 2. Take the generated Police FIR reference to your country Embassy/High Commission in Chanakyapuri to obtain an Emergency Travel Certificate (ETC). 3. Contact your hotel desk with your SURAKSHA QR Identity Pass as temporary identification.',
    suggestedAction: {
      label: 'View Saved Places & Embassies',
      actionType: 'navigate',
      target: '/trips'
    }
  },
  {
    keywords: ['medical', 'hospital', 'doctor', 'ambulance', 'sick', 'injury', 'heart', 'trauma'],
    category: 'firstaid',
    response:
      'For critical medical emergencies, trauma, or chest pain, dial 102 (National Ambulance) or 112 immediately. Major government super-specialty hospitals with 24x7 trauma centers include AIIMS (Ansari Nagar) and RML Hospital (Baba Kharak Singh Marg). For mild heat exhaustion, drink clean bottled water with electrolytes and rest in an air-conditioned facility.',
    suggestedAction: {
      label: 'Dial 102 Ambulance',
      actionType: 'call',
      target: '102'
    }
  },
  {
    keywords: ['women', 'harassment', 'stalking', 'eve teasing', 'female', 'solo female'],
    category: 'helpline',
    response:
      'For female travellers, the Delhi Police operates a dedicated 24x7 Women Safety Helpline at 1091. Female officers are stationed at major tourist posts. If you sense danger, enter any open metro station, hotel lobby, or populated store, and immediately trigger the SURAKSHA Emergency SOS beacon.',
    suggestedAction: {
      label: 'Call Women Helpline 1091',
      actionType: 'call',
      target: '1091'
    }
  },
  {
    keywords: ['sos', 'emergency', 'help', 'danger', 'attack'],
    category: 'helpline',
    response:
      'If you are in direct life danger, tap the red EMERGENCY SOS button on your screen immediately. This logs your GPS coordinates in the SURAKSHA system. For instant government dispatch, dial 112 directly from your phone.',
    suggestedAction: {
      label: 'Dial 112 National Police',
      actionType: 'call',
      target: '112'
    }
  }
];

export class AiAssistantService {
  /**
   * Process a tourist safety query.
   * Deterministic, zero external API keys needed, works 100% offline.
   */
  public static async queryAssistant(userPrompt: string): Promise<ChatMessage> {
    // Simulate brief realistic thinking latency
    await new Promise((r) => setTimeout(r, 650));

    const lower = userPrompt.toLowerCase();

    // Match against knowledge base
    for (const item of SAFETY_KNOWLEDGE_BASE) {
      if (item.keywords.some((kw) => lower.includes(kw))) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: item.response,
          category: item.category,
          suggestedAction: item.suggestedAction,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Default intelligent fallback
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text:
        'As your SURAKSHA Tourist Safety Companion, I recommend keeping your live location updated and staying within designated heritage zones. For official tourist police guidance, dial 1363 (24x7 toll free). For immediate emergency police assistance, call 112.',
      category: 'advisory',
      suggestedAction: {
        label: 'Call Tourist Police (1363)',
        actionType: 'call',
        target: '1363'
      },
      timestamp: new Date().toISOString()
    };
  }
}
