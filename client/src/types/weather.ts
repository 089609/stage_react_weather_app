export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface WindInfo {
  speed: number;
  deg: number;
  gust?: number;
}

export interface CurrentWeather {
  name: string;
  dt: number;
  weather: WeatherCondition[];
  main: WeatherMain;
  wind: WindInfo;
  coord?: { lat: number; lon: number };
  uvIndex?: number;
  sunrise?: string; // ISO string
  sunset?: string;  // ISO string
  precipitation?: number; // mm
  precipitationProbability?: number; // %
  cloudCover?: number; // %
  sys?: {
    country?: string;
  };
}

export interface ForecastItem {
  dt: number;
  main: WeatherMain;
  weather: WeatherCondition[];
  wind: WindInfo;
  dt_txt: string;
}

export interface ForecastResponse {
  city: { name: string; country?: string };
  list: ForecastItem[];
}


