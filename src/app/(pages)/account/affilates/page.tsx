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
				<Box display={'grid'} gridTemplateColumns={'repeat(3, 1fr)'}>
					<Typography>Affilate</Typography>
					<Typography>Count</Typography>
					<Typography>Amount</Typography>
				</Box>
				<Box display={'grid'} gridTemplateColumns={'repeat(3, 1fr)'}>
					<Typography color='primary' fontWeight={'bold'}>cinecom</Typography>
					<Typography>{affilates['cinecom'].count}</Typography>
					<Typography>{affilates['cinecom'].networth}</Typography>
				</Box>
				<Box display={'grid'} gridTemplateColumns={'repeat(3, 1fr)'}>
					<Typography color='primary' fontWeight={'bold'}>premierebasics</Typography>
					<Typography>{affilates['premierebasics'].count}</Typography>
					<Typography>{affilates['premierebasics'].networth}</Typography>
				</Box>
				<Box display={'grid'} gridTemplateColumns={'repeat(3, 1fr)'}>
					<Typography color='primary' fontWeight={'bold'}>aftereffectsbasics</Typography>
					<Typography>{affilates['aftereffectsbasics'].count}</Typography>
					<Typography>{affilates['aftereffectsbasics'].networth}</Typography>
				</Box>
			</Box>
		</Box >
	);
}
