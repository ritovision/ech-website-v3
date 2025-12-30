import {
  createPublicClient,
  http,
  parseAbi,
  hexToBigInt,
  keccak256,
  encodePacked,
  getAddress,
  Chain,
} from "viem";
import { base, baseSepolia, foundry, optimism, optimismSepolia } from "viem/chains"
import { EipAuthor, NetworkUpgrade } from "@/constants/eip-authors";

export const chainId = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID || process.env.CHAIN_ID
);

const rawEipAuthorNftAddress =
  process.env.NEXT_PUBLIC_EIP_AUTHOR_NFT_ADDRESS ||
  process.env.EIP_AUTHOR_NFT_ADDRESS;
export const eipAuthorNftAddress = rawEipAuthorNftAddress
  ? getAddress(rawEipAuthorNftAddress)
  : undefined;

const chains: Record<number, Chain> = {
  [foundry.id]: foundry,
  [base.id]: base,
  [baseSepolia.id]: baseSepolia,
  [optimism.id]: optimism,
  [optimismSepolia.id]: optimismSepolia
}

export function getChain(chainId: number) {
  return chains[chainId]
}

export function getTokenIdOfUpgrade(upgrade: NetworkUpgrade) {
  return hexToBigInt(keccak256(encodePacked(["string"],[upgrade])))
}

export async function hasAlreadyClaimed(githubUsername: string, upgrade: NetworkUpgrade) {
  try {
    if (!eipAuthorNftAddress || !getChain(chainId)) {
      return false
    }
    const tokenId = getTokenIdOfUpgrade(upgrade)
    const client = createPublicClient({
      chain: getChain(chainId),
      transport: http()
    })
    const alreadyClaimed = await client.readContract({
      address: eipAuthorNftAddress,
      abi: parseAbi([
        'function claimed(string calldata author, uint256 id) external view returns (bool)'
      ]),
      functionName: "claimed",
      args: [githubUsername, tokenId]
    })
    return alreadyClaimed
  } catch (error) {
    console.error(error)
    return false
  }
}

// Find an EIP author with case-insensitive GitHub username matching
export function findEipAuthorByGithubUsername(authors: EipAuthor[], username: string) {
  const githubUrl = `https://github.com/${username}`.toLowerCase();
  return authors.find(author => author.github.toLowerCase() === githubUrl);
}
