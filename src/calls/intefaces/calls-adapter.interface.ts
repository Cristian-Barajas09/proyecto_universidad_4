export const CALLS_ADAPTER = 'CALLS_ADAPTER';

export interface GenerateCall {
  startUrl: string;
  joinUrl: string;
}

export interface CallParams {
  date: Date;
  topic: string;
}

export interface CallsAdapter {
  makeCall(params: CallParams): Promise<GenerateCall>;
}
