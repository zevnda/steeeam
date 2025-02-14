import moment from "moment";
import axios from "axios";

export function getRelativeTimePrecise(timestamp) {
    const now = moment();
    const then = moment.unix(timestamp);
    const deltaYears = now.diff(then, 'years', true);

    if (/\.0$/.test(deltaYears.toFixed(1))) {
        if (deltaYears > 1) {
            return `<span style="color: #f5a524">${deltaYears.toFixed()}</span> years`;
        } else if (deltaYears > 0) {
            return `<span style="color: #f5a524">${deltaYears.toFixed()}</span> year`;
        } else {
            return moment(then).fromNow();
        }
    } else {
        if (deltaYears > 1) {
            return `<span style="color: #f5a524">${deltaYears.toFixed(1)}</span> years`;
        } else if (deltaYears > 0) {
            return `<span style="color: #f5a524">${deltaYears.toFixed(1)}</span> year`;
        } else {
            return moment(then).fromNow();
        }
    }
}

export function getRelativeTimeImprecise(timestamp) {
    const now = moment();
    const then = moment.unix(timestamp);
    const deltaYears = now.diff(then, 'years', true);

    if (deltaYears > 1) {
        return `${deltaYears.toFixed(0)} years`;
    } else if (deltaYears > 0) {
        return `${deltaYears.toFixed(0)} year`;
    } else {
        return moment(then).fromNow();
    }
}

export function findAppInData(data, targetAppId) {
    const targetItem = data.find(item => item.appId === targetAppId.toString());
    if (targetItem) {
        const initialPrice = targetItem.initialPrice / 100;
        const formatter = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const initialPriceFormatted = formatter.format(initialPrice);
        return initialPriceFormatted;
    } else {
        return '0.00'
    }
}

export function getAverage(numbers) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }
    return numbers.length === 0 ? 0 : sum / numbers.length;
}

export function kFormatter(num) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}

export function minutesToHoursCompact(number) {
    const durationInMinutes = number;
    const duration = moment.duration(durationInMinutes, "minutes");
    const hours = Math.floor(duration.asHours());
    return hours.toLocaleString();
}

export function minutesToHoursPrecise(number) {
    const durationInMinutes = number;
    const duration = moment.duration(durationInMinutes, "minutes");
    const hours = duration.asHours();
    return hours.toFixed(1);
}

export function getMaxByProperty(data, property) {
    return data.reduce((acc, curr) => (curr[property] > acc[property] ? curr : acc), data[0]);
}

export function getMinByProperty(data, property) {
    return data.reduce((acc, curr) => (curr[property] < acc[property] ? curr : acc), data[0]);
}

export function pricePerHour(totalCost, totalPlaytime, countryAbbr) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: countryAbbr ? countryAbbr : 'USD' });
    if (!totalPlaytime || totalPlaytime === '0') return formatter.format(0);
    const totalCostFloat = parseInt(totalCost.replace(/[^\d.-]/g, ''), 10) * 100;
    const totalCostFormatted = (totalCostFloat / 100).toFixed();
    const totalPlaytimeFormatted = totalPlaytime.replace(',', '');
    const pricePerHour = parseInt(totalCostFormatted) / parseInt(totalPlaytimeFormatted);
    const formattedPrice = formatter.format(pricePerHour);
    return formattedPrice;
}

export function formatSteamProfileUrl(url) {
    const output = url.replace('https://steamcommunity.com/id/', '').replace('https://steamcommunity.com/profiles/', '');
    return output;
}

export async function resolveVanityUrl(uid) {
    const steamIdCheck = await axios.get(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${uid}`);
    if (steamIdCheck.data.response.steamid) {
        return steamIdCheck.data.response.steamid;
    } else {
        return uid;
    }
}

export function sidToShortURL(sid) {
    const replacements = 'bcdfghjkmnpqrtvw';
    const hex = sid.accountid.toString(16);
    let output = '';
    for (let i = 0; i < hex.length; i++) {
        output += replacements[parseInt(hex[i], 16)];
    }
    const splitAt = Math.floor(output.length / 2);
    output = output.substring(0, splitAt) + '-' + output.substring(splitAt);
    return 'https://s.team/p/' + output;
}