import { useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';

export default function SerpentImage(props: any) {
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState('');

  // load the image
  useEffect(() => {
    (async () => {
      try {
        const blob = await (await fetch(props.image)).blob();
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          setImage(reader.result as string);
          setLoading(false);
        };
      } catch (error) {
        console.error('failed to fetch image');
      }
    })();
  }, [props.image]);

  return loading ? (
    <Skeleton
      variant="rectangular"
      sx={{
        maxWidth: '90%',
        margin: '0 auto',
        height: '300px',
      }}
    ></Skeleton>
  ) : (
    <img
      src={image}
      alt="serpent"
      style={{
        display: 'block',
        height: 'auto',
        margin: '0 auto',
        border: '3px solid #00000077',
        maxWidth: '90%',
      }}
    ></img>
  );
}
