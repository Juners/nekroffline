export type EmoteUsageStats = {
	realAmmount: number;
	ammount: number;
};

export type EmoteUsage = {
	twitch: { [emoteId: string]: EmoteUsageStats };
	seventv: { [emoteId: string]: EmoteUsageStats };
};

export type Emote7tvData = {
	realAmmount: number;
	ammount: number;
	data: {
		id: string;
		name: string;
		animated: boolean;
		listed: boolean;
	};
};

export type ChannelEmoteData = {
	realAmmount: number;
	ammount: number;
	data: {
		id: string;
		tier: number;
		name: string;
		scale: string[];
		theme_mode: string[];
		format: string[];
	};
};

export type EmoteNode = {
	type: '7tv' | 'twitch';
	data: { ammount: number; realAmmount: number };
	node: HTMLDivElement | null;
};
