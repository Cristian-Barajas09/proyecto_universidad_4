import { AxiosError } from 'axios';
import type {
  CallsAdapter,
  GenerateCall,
  CallParams,
} from '../intefaces/calls-adapter.interface';
import type {
  ZoomAuthResponse,
  ZoomCallResponse,
} from '../intefaces/zoom-response.interface';
import axios from 'axios';

export class ZoomAdapter implements CallsAdapter {
  public constructor(
    private readonly apiClientId: string,
    private readonly apiSecret: string,
    private readonly apiAccountId: string,
    private readonly zoomURL: string,
  ) {}

  private async authenticate(): Promise<string> {
    try {
      const body = new URLSearchParams();
      body.append('grant_type', 'account_credentials');
      body.append('account_id', this.apiAccountId);

      const basicAuth = Buffer.from(
        `${this.apiClientId}:${this.apiSecret}`,
      ).toString('base64');

      const response = await axios.post<ZoomAuthResponse>(
        `${this.zoomURL}/oauth/token`,
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
        },
      );

      console.log(response.data);

      return response.data.access_token;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log('Zoom authentication error:', error.response?.data);
      }

      throw new Error('Failed to authenticate with Zoom API');
    }
  }

  public async makeCall({ topic, date }: CallParams): Promise<GenerateCall> {
    const token = await this.authenticate();

    try {
      const response = await axios.post<ZoomCallResponse>(
        `https://api.zoom.us/v2/users/me/meetings`,
        {
          topic: topic,
          type: 2,
          duration: 45,
          password: 'ZoomPass12',
          start_time: date.toISOString(),
          timezone: 'America/Santiago',
          settings: {
            host_video: true,
            participant_video: true,
            waiting_room: true,
            mute_upon_entry: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        startUrl: response.data.start_url,
        joinUrl: response.data.join_url,
      };
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create Zoom meeting');
    }
  }
}
