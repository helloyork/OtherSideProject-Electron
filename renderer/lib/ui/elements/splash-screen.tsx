import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from '@/public/static/images/mewbaka.png';

const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="inset-0 z-50 flex items-center justify-center bg-white h-[93dvh]"
        >
            <div className="flex items-center justify-center" style={{ height: '50vh', width: '50vw' }}>
                <Image src={logo} alt="Logo" className="object-contain" />
            </div>
        </motion.div>
    );
};

export default SplashScreen;