import type {
  CallsAdapter,
  GenerateCall,
  CallParams
} from '../intefaces/calls-adapter.interface';
import type {
  ZoomAuthResponse,
  ZoomCallResponse,
} from '../intefaces/zoom-response.interface';
import axios from 'axios';

export class ZoomAdapter implements CallsAdapter {
  public constructor(
    private readonly apiKey = process.env.ZOOM_API_KEY,
    private readonly apiSecret = process.env.ZOOM_API_SECRET,
    private readonly zoomURL = process.env.ZOOM_URL,
  ) { }

  private async authenticate(): Promise<string> {
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('client_id', this.apiKey as string);
    body.append('client_secret', this.apiSecret as string);

    const response = await axios.post<ZoomAuthResponse>(
      `${this.zoomURL}/oauth/token`,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  }

  public async makeCall({ topic, date }: CallParams ): Promise<GenerateCall> {
    const token = await this.authenticate();

  

    const response = await axios.post<ZoomCallResponse>(
      `${this.zoomURL}/users/me/meetings`,
      {
        topic: topic,
        type: 2,
        "duration": 45,
        "password": "ZoomPass12",
        "start_time": date.toISOString(),
        "timezone": "America/Santiago",
        "settings": {
          "host_video": true,
          "participant_video": true,
          "waiting_room": true,
          "mute_upon_entry": true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      url: response.data.join_url,
    };
  }
}
