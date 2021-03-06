import { memo, useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Image from 'next/image';
import Box from '@mui/material/Box';

type Props = {
  image: string;
};

const NftImage = function ({ image }: Props) {
  const [loading, setLoading] = useState(true);
  const [imageBuffer, setImageBuffer] = useState('');

  // load the image
  useEffect(() => {
    (async () => {
      try {
        const blob = await (await fetch(image)).blob();
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          setImageBuffer(reader.result as string);
          setLoading(false);
        };
      } catch (error) {
        console.error('failed to fetch image');
      }
    })();
  }, [image]);

  return (
    <Box
      sx={{
        display: 'block',
        width: '106px',
        height: '106px',
        border: '3px solid',
        borderColor: '#00000055',
      }}
    >
      {loading ? (
        <Skeleton
          variant="rectangular"
          sx={{
            width: '100px',
            height: '100px',
          }}
        ></Skeleton>
      ) : (
        <Image src={imageBuffer} alt="serpent" width="100" height="100" />
      )}
    </Box>
  );
};

const MemoNftImage = memo(NftImage);
export default MemoNftImage;
