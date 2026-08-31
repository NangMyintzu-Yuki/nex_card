declare module "pusher-js" {
  export default class Pusher {
    constructor(key: string, opts: { cluster: string });
    subscribe(channel: string): Channel;
    unsubscribe(channel: string): void;
    disconnect(): void;
  }

  interface Channel {
    bind(event: string, callback: (data: any) => void): void;
    unbind(event: string): void;
  }
}
