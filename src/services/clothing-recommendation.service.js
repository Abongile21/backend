const DEFAULT_RULES = Object.freeze({
  warmCelsius: 25,
  mildCelsius: 18,
  coolCelsius: 10,
  humidPercent: 75,
  strongWindKph: 30,
  rainMm: 0.5,
  highSolarIrradianceWm2: 600,
  temperatureSwingCelsius: 7
});

function validNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export class ClothingRecommendationService {
  constructor(rules = {}) {
    this.rules = Object.freeze({ ...DEFAULT_RULES, ...rules });
  }

  recommend(observation) {
    const temperature = validNumber(observation.feelsLikeCelsius)
      ? observation.feelsLikeCelsius
      : observation.temperatureCelsius;
    const clothing = [];
    const footwear = [];
    const advice = [];
    const explanations = [];

    if (validNumber(temperature)) {
      if (temperature >= this.rules.warmCelsius) {
        clothing.push('Breathable T-shirt and lightweight clothing');
        explanations.push(`Lightweight clothing suits the ${temperature}°C apparent temperature.`);
      } else if (temperature >= this.rules.mildCelsius) {
        clothing.push('Long-sleeved shirt or a light layer');
        explanations.push(`A light layer is practical at ${temperature}°C.`);
      } else if (temperature >= this.rules.coolCelsius) {
        clothing.push('Sweater or hoodie with a jacket');
        explanations.push(`Warm layers help in the ${temperature}°C conditions.`);
      } else {
        clothing.push('Insulating layers, warm coat and gloves');
        explanations.push(`Insulating outerwear is appropriate at ${temperature}°C.`);
      }
    } else {
      advice.push('Temperature is unavailable; no temperature-based clothing advice can be made.');
    }

    if (validNumber(observation.precipitationMm) && observation.precipitationMm >= this.rules.rainMm) {
      clothing.push('Water-resistant raincoat');
      footwear.push('Waterproof shoes or boots');
      explanations.push(`Rain protection is recommended because precipitation is ${observation.precipitationMm} mm.`);
    }
    if (validNumber(observation.humidityPercent) && observation.humidityPercent >= this.rules.humidPercent) {
      advice.push(`High humidity (${observation.humidityPercent}%) can make exertion feel less comfortable; choose breathable fabrics.`);
    }
    if (validNumber(observation.windKph) && observation.windKph >= this.rules.strongWindKph) {
      clothing.push('Wind-resistant outer layer');
      explanations.push(`A wind-resistant layer helps in ${observation.windKph} km/h winds.`);
    }
    if (validNumber(observation.solarIrradianceWm2) &&
      observation.solarIrradianceWm2 >= this.rules.highSolarIrradianceWm2) {
      clothing.push('Sun-protective clothing and a brimmed hat');
      advice.push('Seek shade and use sun protection during periods of high solar irradiance.');
      explanations.push(`Solar irradiance is ${observation.solarIrradianceWm2} W/m².`);
    }

    const forecastTemperatures = Array.isArray(observation.forecastTemperaturesCelsius)
      ? observation.forecastTemperaturesCelsius.filter(validNumber)
      : [];
    if (forecastTemperatures.length > 1) {
      const swing = Math.max(...forecastTemperatures) - Math.min(...forecastTemperatures);
      if (swing >= this.rules.temperatureSwingCelsius) {
        clothing.push('Use removable layers as temperatures change through the day');
        explanations.push(`Forecast temperatures vary by ${swing}°C across the requested period.`);
      }
    }

    if (!footwear.length) footwear.push('Comfortable everyday footwear');
    return {
      location: observation.location,
      observation: {
        temperatureCelsius: validNumber(observation.temperatureCelsius) ? observation.temperatureCelsius : null,
        feelsLikeCelsius: validNumber(observation.feelsLikeCelsius) ? observation.feelsLikeCelsius : null,
        humidityPercent: validNumber(observation.humidityPercent) ? observation.humidityPercent : null,
        windKph: validNumber(observation.windKph) ? observation.windKph : null,
        precipitationMm: validNumber(observation.precipitationMm) ? observation.precipitationMm : null,
        solarIrradianceWm2: validNumber(observation.solarIrradianceWm2) ? observation.solarIrradianceWm2 : null,
        forecastTemperaturesCelsius: forecastTemperatures
      },
      clothing,
      footwear,
      advice,
      explanations,
      dataSource: 'FortyGuard'
    };
  }
}

export { DEFAULT_RULES };
