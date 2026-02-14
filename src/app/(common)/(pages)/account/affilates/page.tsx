'use client'

import { Box, Divider, List, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const boxStyle = {
	"& p, a": { fontWeight: "400" },
	"& h1, h2": { fontWeight: "500" }
}

type AffilateKey = 'cinecom' | 'premierebasics' | 'aftereffectsbasics';
type AffilateProps = {
	count: number
	networth: number
}
type Affilates = Record<AffilateKey, AffilateProps>

const initialAffilates: Affilates = {
	cinecom: {
		count: 0,
		networth: 0
	},
	premierebasics: {
		count: 0,
		networth: 0
	},
	aftereffectsbasics: {
		count: 0,
		networth: 0
	}
}

export default function AccountExtension() {
	const [affilates, setAffilates] = useState<Affilates>(initialAffilates);

	useEffect(() => {
		fetch('/api/affilates').then((res) => res.json()).then(setAffilates)
	}, [])

	return (
		<Box sx={boxStyle}>
			<Typography variant='h1' sx={{ fontSize: "1.2rem" }}>
				Affilates
			</Typography >
			<Divider sx={{ my: "1rem" }} />
			<Box display={'flex'} flexDirection={'column'} gap={'1rem'}>
				<Box display={'grid'} gridTemplateColumns={'130px repeat(2, 1fr)'}>
					<Typography sx={{ justifySelf: 'flex-start' }}>Affilate</Typography>
					<Typography sx={{ justifySelf: 'flex-end' }}>Count</Typography>
					<Typography sx={{ justifySelf: 'flex-end' }}>Amount</Typography>
				</Box>
				<Box display={'grid'} gridTemplateColumns={'130px repeat(2, 1fr)'}>
					<Typography sx={{ justifySelf: 'flex-start' }} color='primary' fontWeight={'bold'}>cinecom</Typography>
					<Typography sx={{ justifySelf: 'flex-end' }}>{affilates['cinecom'].count}</Typography>
					<Typography sx={{ justifySelf: 'flex-end' }}>{affilates['cinecom'].networth}</Typography>
				</Box>
				<Box display={'grid'} gridTemplateColumns={'130px repeat(2, 1fr)'}>
					<Typography sx={{ justifySelf: 'flex-start' }} color='primary' fontWeight={'bold'}>premierebasics</Typography>
					<Typography sx={{ justifySelf: 'flex-end' }}>{affilates['premierebasics'].count}</Typography>
					<Typography sx={{ justifySelf: 'flex-end' }}>{affilates['premierebasics'].networth}</Typography>
				</Box>
				<Box display={'grid'} gridTemplateColumns={'130px repeat(2, 1fr)'}>
					<Typography sx={{ justifySelf: 'flex-start' }} color='primary' fontWeight={'bold'}>aftereffectsbasics</Typography>
					<Typography sx={{ justifySelf: 'flex-end' }}>{affilates['aftereffectsbasics'].count}</Typography>
					<Typography sx={{ justifySelf: 'flex-end' }}>{affilates['aftereffectsbasics'].networth}</Typography>
				</Box>
			</Box>
		</Box >
	);
}
