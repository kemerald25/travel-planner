
import type { Coin } from '../types';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetches the current value of a specified amount of cryptocurrency in USD.
 * @param tokenId - The CoinGecko API ID for the cryptocurrency (e.g., 'bitcoin', 'ethereum').
 * @param amount - The amount of the cryptocurrency.
 * @returns The total value in USD.
 */
export const getCryptoValueInUSD = async (tokenId: string, amount: number): Promise<number> => {
  if (!tokenId) {
    throw new Error('Token ID is required.');
  }
  
  const formattedTokenId = tokenId.trim().toLowerCase();
  const url = `${API_BASE_URL}/simple/price?ids=${formattedTokenId}&vs_currencies=usd`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // CoinGecko API might return 404 for unknown IDs, which is a client error.
      const errorData = await response.json().catch(() => null);
      console.error("CoinGecko API Error Response:", errorData);
      throw new Error(`Failed to fetch price data. Please check the crypto ID.`);
    }

    const data = await response.json();

    if (!data[formattedTokenId] || typeof data[formattedTokenId].usd === 'undefined') {
      throw new Error(`Invalid crypto ID: "${tokenId}". Please use a valid CoinGecko ID (e.g., 'bitcoin').`);
    }

    const pricePerToken: number = data[formattedTokenId].usd;
    return pricePerToken * amount;

  } catch (error) {
    console.error('Error in getCryptoValueInUSD:', error);
    // Re-throw a more user-friendly error message
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while fetching cryptocurrency price.');
  }
};

/**
 * Fetches the list of all available cryptocurrencies from CoinGecko.
 * @returns A promise that resolves to an array of Coin objects.
 */
export const getCoinList = async (): Promise<Coin[]> => {
    const url = `${API_BASE_URL}/coins/list`;
    try {
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error('Failed to fetch the list of cryptocurrencies.');
        }
        const data: Coin[] = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getCoinList:', error);
        throw new Error('An unknown error occurred while fetching the cryptocurrency list.');
    }
}
