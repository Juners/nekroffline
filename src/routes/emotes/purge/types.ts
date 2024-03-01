export type EmoteUsageStats = {
	realAmmount: number;
	ammount: number;
};

export type EmoteUsage = {
	twitch: { [emoteId: string]: EmoteUsageStats };
	seventv: { [emoteId: string]: EmoteUsageStats };
};

export type FlatEmoteUsage = { id: string; type: 'twitch' | '7tv'; stats: EmoteUsageStats };

export type Emote7tvData = {
	id: string;
	name: string;
	flags: number;
	timestamp: number;
	actor_id: string;
	data: {
		id: string;
		name: string;
		flags: number;
		tags?: string[];
		lifecycle: number;
		state: string[];
		listed: boolean;
		animated: boolean;
		owner: {
			id: string;
			username: string;
			display_name: string;
			avatar_url?: string;
			style: {
				color?: number;
			};
			roles?: string[];
		};
		host: {
			url: string;
			files: {
				name: string;
				static_name: string;
				width: number;
				height: number;
				frame_count: number;
				size: number;
				format: string;
			}[];
		};
	};
};

export type ChannelEmoteData = {
	id: string;
	name: string;
	images: {
		url_1x: string;
		url_2x: string;
		url_4x: string;
	};
	tier: string;
	emote_type: string;
	emote_set_id: string;
	format: string[];
	scale: string[];
	theme_mode: string[];
};
